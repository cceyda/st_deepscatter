// import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm';

import { tableFromIPC } from 'apache-arrow';
import { Streamlit } from "streamlit-component-lib";
import Scatterplot from './deepscatter.js';

console.log("Mounted")
let window_height = 600
let window_width = 600

const scatterplot = new Scatterplot('#deepscatter', window_width, window_height);
// window.plot = scatterplot; // For debugging
const lasso_canvas = document.getElementById('lasso-overlay');
const lasso_ctx = lasso_canvas.getContext('2d');

lasso_canvas.addEventListener('mousedown', startDrawing);
lasso_canvas.addEventListener('mousemove', draw);
lasso_canvas.addEventListener('mouseup', endDrawing);
lasso_canvas.addEventListener('wheel', passThroughEvent);
lasso_canvas.addEventListener('mousemove', passThroughEvent);
lasso_canvas.addEventListener('click', selectLasso);


let lassoPoints = [];
let is_initialized = false;
let isDrawing = false;
let id_column = "id"
let current_lasso = null
let tooltip_columns
let show_tooltip = true

let state = {
    "counter": 0,
    "zoom_state": null,
    "selected_points": null,
    "hovered_point": null,
    "selected_lassos": new Set(),
    "lassos": {} // {name: {bbox: [x:[x0,x1],y:[y0,y1]], polygon: [{x,y}], point_count:int}}
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
        handleDeleteOrBackspace();
    }
});

function drawLasso(lassoPoints) {

    lasso_ctx.beginPath();
    lasso_ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
    for (let i = 1; i < lassoPoints.length; i++) {
        lasso_ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    }
    lasso_ctx.closePath();
    lasso_ctx.stroke();
}

function redraw_lasso_canvas(scales) {
    // Clear the whole canvas
    lasso_ctx.clearRect(0, 0, lasso_canvas.width, lasso_canvas.height);

    // Re-Draw all lassos
    for (const lassoId in state.lassos) {
        const scaled_box = state.lassos[lassoId]['bbox']
        const descaled_box = {
            x: [scales.x_(scaled_box.x[0]), scales.x_(scaled_box.x[1])],
            y: [scales.y_(scaled_box.y[0]), scales.y_(scaled_box.y[1])]
        }
        const scaled_lassoPoints = state.lassos[lassoId]['polygon']
        const descaled_lassoPoints = scaled_lassoPoints.map(point => {
            return {
                x: scales.x_(point.x),
                y: scales.y_(point.y)
            }
        })
        drawLasso(descaled_lassoPoints)
        drawBoundingBox(descaled_box)

        

        if (lassoId==current_lasso) {
            applyFillToLasso(descaled_box)
        }
    }
}

function handleDeleteOrBackspace() {
    if (!current_lasso) return;
    clearLasso(current_lasso)
    
}

// window.select = select; // For the click function below.
function selectLasso(event) {
    if (isDrawing) return;
    let clickX = event.offsetX;
    let clickY = event.offsetY;
    clickX = scatterplot._zoom.scales().x_.invert(clickX)
    clickY = scatterplot._zoom.scales().y_.invert(clickY)
    current_lasso = null
    for (const lassoId in state.lassos) {
        const lasso_boundingbox = state.lassos[lassoId]['bbox'];
        if (clickX >= lasso_boundingbox.x[0] && clickX <= lasso_boundingbox.x[1] && clickY >= lasso_boundingbox.y[0] && clickY <= lasso_boundingbox.y[1]) {
            console.log('Clicked on lasso:', lassoId);
            current_lasso = lassoId
            state["selected_lassos"].add(lassoId)
            redraw_lasso_canvas(scatterplot._zoom.scales())

            let {selected_points,selected_ids} = getpointsInLasso(state.lassos[lassoId]['bbox'], state.lassos[lassoId]['polygon'])
            // scatterplot.select_and_plot({ lassoId, ids: selected_ids, idField: id_column });
            // scatterplot.dataset.root_tile.apply_transformation(lassoId)
            
            scatterplot.select_and_plot({useNameCache: true, name: lassoId})
            // scatterplot.plotAPI({
            //     encoding: {
            //       foreground: {
            //         field: lassoId,
            //         op: "eq",
            //         a: 1
            //       }
            //     }
            //   })

            state["selected_points"] = selected_points

            break;
        }
    }
    state["selected_lassos_list"] = Array.from(state["selected_lassos"])
    Streamlit.setComponentValue(state)
}

function applyFillToLasso(boundingBox) {

    lasso_ctx.fillStyle = 'rgba(173, 216, 230, 0.25)'; // Light blue with 50% opacity
    lasso_ctx.fillRect(boundingBox.x[0], boundingBox.y[0], boundingBox.x[1] - boundingBox.x[0], boundingBox.y[1] - boundingBox.y[0]);
}


function passThroughEvent(event) {

    event.preventDefault();
    // Get the original event coordinates
    const { clientX, clientY } = event;

    // Find all elements at the same coordinates, regardless of z-index
    const elementsUnderCursor = document.elementsFromPoint(clientX, clientY);

    // Remove the element that caught the event first (so we don't double-dispatch)
    elementsUnderCursor.shift();

    // Manually dispatch the event to all elements underneath
    if (elementsUnderCursor.length === 0) return;
    
    const newEvent = new event.constructor(event.type, event);
    elementsUnderCursor[0].dispatchEvent(newEvent);
    

    // // Manually dispatch the event to all elements underneath
    // elementsUnderCursor.forEach(element => {
    //     const newEvent = new event.constructor(event.type, event);
    //     element.dispatchEvent(newEvent);
    // });
}

function startDrawing(event) {
    if (event.ctrlKey || event.metaKey) return passThroughEvent(event);
    isDrawing = true;
    lassoPoints = [{ x: event.offsetX, y: event.offsetY }];
    lasso_ctx.beginPath();
    lasso_ctx.moveTo(event.offsetX, event.offsetY);
}

function draw(event) {
    if (!isDrawing) return;
    lassoPoints.push({ x: event.offsetX, y: event.offsetY });
    lasso_ctx.lineTo(event.offsetX, event.offsetY);
    lasso_ctx.stroke();
}


function drawBoundingBox(boundingBox) {
    // Draw bounding box with dotted line
    lasso_ctx.setLineDash([5, 5]); // Set line dash pattern
    lasso_ctx.beginPath();
    lasso_ctx.rect(boundingBox.x[0], boundingBox.y[0], boundingBox.x[1] - boundingBox.x[0], boundingBox.y[1] - boundingBox.y[0]);
    lasso_ctx.stroke();
    lasso_ctx.setLineDash([]); // Reset line dash pattern
}

function clearLasso(lasso_id) { 

    console.log('Deleting lasso:', lasso_id)
    delete state.lassos[lasso_id]
    state["selected_lassos"].delete(lasso_id);
    // Would be better to also delete the unused column & transformation but this deletes everything?
    // scatterplot.dataset.root_tile.delete_column_if_exists(lasso_id) 
    redraw_lasso_canvas(scatterplot._zoom.scales())
    state["selected_lassos_list"] = Array.from(state["selected_lassos"])
    Streamlit.setComponentValue(state)
}

function getpointsInLasso(scaled_box, scaled_polygon) {

    let points = scatterplot.dataset.points(scaled_box)
    let selected_points = []
    let selected_ids = []
    points.forEach(point => {

        let is_inlasso=isPointInPolygon(point, scaled_polygon)
        if (is_inlasso) {
            let p = JSON.parse(point.toString())
            selected_points.push(p)
            selected_ids.push(point[id_column])
        }
       
    });
    console.log('points:', selected_points)
    return {selected_points, selected_ids}
}


function endDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    lasso_ctx.lineTo(lassoPoints[0].x, lassoPoints[0].y); // Close the loop
    lasso_ctx.stroke();
    lasso_ctx.closePath();
    console.log('Polygon points:', lassoPoints);

    let boundingBox = getBoundingBox(lassoPoints);
    console.log('Polygon boundingBox:', boundingBox);

    let scales = scatterplot._zoom.scales()

    let scaled_box = {
        x: [scales.x_.invert(boundingBox.x[0]), scales.x_.invert(boundingBox.x[1])],
        y: [scales.y_.invert(boundingBox.y[0]), scales.y_.invert(boundingBox.y[1])]
    }
    console.log('Scaled boundingBox:', scaled_box);

    let scaled_lassoPoints = lassoPoints.map(point => {
        return {
            x: scales.x_.invert(point.x),
            y: scales.y_.invert(point.y)
        }
    })

    // scatterplot._zoom.zoom_to_bbox(scaled_box); 

    let {selected_points,selected_ids} = getpointsInLasso(scaled_box, scaled_lassoPoints)

    if (selected_points.length > 0) {
        drawBoundingBox(boundingBox)
        
        const name = Math.random().toString(36);
        state["lassos"][name] = {
            "bbox": scaled_box,
            "polygon": scaled_lassoPoints,
            "point_count": selected_points.length
        }
        state["selected_lassos"].add(name)

        scatterplot.select_and_plot({ name, ids: selected_ids, idField: id_column});

        state["selected_points"] = selected_points
        state["selected_lassos_list"] = Array.from(state["selected_lassos"])
        
        Streamlit.setComponentValue(state)
    } else {
        redraw_lasso_canvas(scatterplot._zoom.scales())

    }

}

function isPointInPolygon(point, polygon) {
    let x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;

        let intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getBoundingBox(polygon) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < polygon.length; i++) {
        let point = polygon[i];
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.x > maxX) maxX = point.x;
        if (point.y > maxY) maxY = point.y;
    }
    return { x: [minX, maxX], y: [minY, maxY] }
}

scatterplot.click_function = (datum, plot) => {
    // Your logic here
    let d = JSON.parse(datum.toString())
    console.log("Clicked data:", d);
    state["selected_points"] = d
    Streamlit.setComponentValue(state)
    // You can also use 'plot' if needed
}

scatterplot.tooltip_html = (datum, plot) => {
    // Your logic here
    let d = JSON.parse(datum.toString())

    console.log("tooltip data:", d);
    let output= null
    if (show_tooltip){
        const nope = /* @__PURE__ */ new Set([
            "x",
            "y",
            "ix",
            null,
            "tile_key"
          ]);
        output = "<dl>";
        for (const [k, v] of datum) {
          if (!tooltip_columns.includes(k) || nope.has(k)) {
            continue;
          }
          output += ` <dt>${String(k)}</dt>`;
          output += `   <dd>${String(v)}<dd>`;
        }
        output = `${output}</dl>`

    }
    
    state["hovered_point"] = d
    Streamlit.setComponentValue(state)
    return output

    // You can also use 'plot' if needed
}

scatterplot.on_zoom = (transform) => {
    console.log('zoomed:', transform)
    // update stuff like lasso here 
    if (state['lassos']) redraw_lasso_canvas(scatterplot._zoom.scales())

    state["zoom_state"] = scatterplot._zoom.current_corners()
    Streamlit.setComponentValue(state)
}

scatterplot.ready.then(() => {
    console.log('Plot is ready')
    Streamlit.setFrameHeight(window_height)

    window_height = document.documentElement.clientHeight
    window_width = document.documentElement.clientWidth

    if (lasso_canvas) {
        lasso_canvas.height = scatterplot.height
        lasso_canvas.width = scatterplot.width
    }
    // Finished rendering
    console.log('Plot is initialized')
    is_initialized = true

})


// This reruns everytime you call Streamlit.setComponentValue
const onDataFromPython = (event) => {

    state["counter"] += 1
    console.log("Data from python", state["counter"])

    const data = event.detail
    const lasso_mode = data.args.lasso_mode
    // window_height = data.args.height

    // console.log(window_height, window_width)


    if (lasso_mode) {
        lasso_canvas.style.zIndex = "50";
        lasso_canvas.style.position = "relative";
    } else {
        lasso_canvas.style.zIndex = "-50";
    }

    if (!is_initialized) {
        console.log("Initializing")

        const prefs = data.args.prefs
        const arrow_table = data.args.arrow_table
        const exclude_columns = data.args.exclude_columns
        show_tooltip = data.args.show_tooltip
        
        id_column = data.args.id_column

        console.log(arrow_table)
        window.arrow_table = arrow_table

        console.log(prefs)

        if (arrow_table) {
            const table = tableFromIPC(arrow_table.serialize().data)
            let fields = arrow_table.dataTable.schema.fields;
            // const vs=transformObject(arrow_table,exclude_columns)

            // const table = new Table([new Table(vs)])
            console.log(table)
            console.log(fields)
            const matchedField = fields.find(field => field.name === id_column);

            tooltip_columns = fields.map(field => field.name)
            if (exclude_columns){
                tooltip_columns = tooltip_columns.filter(column => !exclude_columns.includes(column));
            }

            if (matchedField) {
                console.log(`ID Field exists: ${matchedField.name}`);
                console.log(`Field type: ${matchedField.type}`);
            } else {
                console.log(`ID Field ${id_column} does not exist`);
            }
            prefs['arrow_table'] = table
            window.table_data = table
        }
        
        scatterplot.plotAPI(prefs)

    }
    else {
        console.log("Receiving data")
        // Streamlit.setComponentValue(state)
    }


}

Streamlit.events.addEventListener(
    Streamlit.RENDER_EVENT, onDataFromPython
)

Streamlit.setComponentReady()
console.log('Called Component ready')


// scatterplot._zoom.set_highlit_point(point);