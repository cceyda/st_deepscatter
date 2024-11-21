# WIP

Very much buggy right now! proceed at your own risk

# DeepScatter Component for Streamlit

This repo is a Streamlit custom component wrapper for the [deepscatter](https://github.com/nomic-ai/deepscatter) library by Nomic AI.

Why deepscatter: It is a very performant library for visualizing very large datasets (scaling to billions of points), refer to original documentation.

# How to use:

```
@st.fragment
def plot_deepscatter():
    plot_state = st_deepscatter(encoding=encoding, # This is the same dict structure as in deepscatter
                            arrow_table=arrow_table, # Pass your data
                            id_column="row_id", # If your data has an id column other than id
                            container_height=400, # Container height is needed
                            lasso_mode=lasso_mode, # switch between lasso & just view mode
                            show_tooltip=True, # Can hide tooltip on hover
                            exclude_columns=None, # If you don't want certain columns showing in tooltip
                            key="my_deepscatter", # whatever key for streamlit component
                            #    on_change=on_plot_change, # can use callbacks like this
                            **prefs # This is the same dict structure as in deepscatter
                            )
plot_deepscatter()
```

 This component passes back and forth the state of the deepscatter plot between the js backend and the streamlit side so you can do with it as you wish. 


```

let state = {
    "zoom_state": null, // Changes everytime the plot is moved or zoomed
    "selected_points": null,
    "hovered_point": null,
    "selected_lassos": new Set(),
    "lassos": {} // Is an object like {name: {bbox: [x:[x0,x1],y:[y0,y1]], polygon: [{x,y}], point_count:int}}
}

```

To avoid the plot rerendering everytime streamlit is rerun you must wrap the scatter plot in a fragment! And everytime a whole page rerun is gonna be triggered you should set the `prefs["zoom"]` to the last recieved `zoom_state` if you want your plot to maintain its state (and should also pass other state variables back into the plot). I know this is hacky but there is no other way to maintain the state otherwise (that I know of). This is also making it somewhat more resource intensive

- Returning hovered points may be slow if you hover over too many points fastly (if your plot is dense set `return_hovered_point=False`)

# Supported features

- Can do lasso selections and access the selected points in streamlit
    - To move the plot during lasso mode use the ctrl/meta key
- Can get clicked points
- Can choose which columns to use for encoding (color,size etc) in the plot


# Known issues

- After deleting lasso selected point effect doesn't disappear (currently ignoring as non issue because you can just make another selection to deselect those points)
- Cannot hover over/click gray points. the deepscatter hover logic checks the color of the point to decide if it can be selected I know where the logic is (@ color_pick_single) I just don't want to modify the deepscatter.js itself, & havent spent the time reverse engineering the logic.
- Haven't added selecting multiple lassos with AND|OR conditionals yet. If you want to do that you can draw the lassos & select the relevant ids on the dataframe using df operations and pass the `selected_ids` param as a work around
- Cannot change the size of plot after initialization (due to deepscatter limitation)
- Cannot change background color of plot after initialization (due to deepscatter limitation)(maybe fixed in https://github.com/nomic-ai/deepscatter/commit/a6ba0519ad322c341aed29824567eecacf19cf0b#diff-992ad8503145878e7d7c291705607d39b094c160bc7120f54c7c024624867f4cR26)
- Once a lasso is drawn a bool column associated with it is added (with a randomly generated name), after lasso is deleted this column remains. If you do a lot of select/delete this may slow performance overtime.


# Contribute
Contributions are welcome just open and issue & PR


## Running in development mode

In the frontend folder run
`npm run dev`

In the st_deepscatter folder run
`streamlit run scatter.py ` 

# License
Following the licence of deepscatter this is also licenced as CC BY-NC-SA 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License)