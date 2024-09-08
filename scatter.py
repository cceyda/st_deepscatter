import polars as pl
import streamlit as st
from st_deepscatter import st_deepscatter

st.set_page_config(layout="wide")

df = pl.read_csv("data/example.csv").head(65536)

# st.write(df)

tiles = "./visualize/tiles"

st.title("Scatter Plot Demo")

prefs = {
    # source_url: '/tiles',
    "source_url": "https://bmschmidt.github.io/vietnam_war",
    # arrow_table: table,
    # "click_function":
    #   "Streamlit.setComponentValue(datum)",
    # zoom: {
    #   bbox: {
    #     x: [99.15172120932304, 114.17888963818825],
    #     y: [7.0849741134400706, 23.626158008070647],
    #   },
    # },
    # labels: {
    #           url: `/tests/${field}.geojson`,
    #           name: undefined,
    #           label_field: field,
    #           size_field: undefined,
    #         },
}

encoding = {
    # filter: {
    #         field: 'MSNDATE',
    #         op: 'within',
    #         a: 15,
    #         b: this.valueAsNumber,
    #       },
    # "jitter_radius": {
    #     "method": 'uniform',
    #     "constant": .05,
    #   },
    # jitter_speed: {
    #  ???
    # },
    # foreground: {
    #   field: selection.name,
    #   op: 'eq',
    #   a: 1
    # }, 
    "x": {
        "field": "x",
        "transform": "literal",
    },
    "y": {
        "field": "y",
        "transform": "literal",
    },
    #       x0 (for animations; transitions between x0 and x)
    # y0 (for animations; transitions between y0 and y)
}

# prefs['click_function']
# prefs['tooltip_html']
# const default_background_options = {
#   color: "gray",
#   opacity: [0.2, 1],
#   size: [0.66, 1],
#   mouseover: false
# };
# const default_API_call = {
#   zoom_balance: 0.35,
#   // One second transitions
#   duration: 1e3,
#   // Not many points.
#   max_points: 1e3,
#   // Encoding defaults are handled by the Aesthetic class.
#   encoding: {},
#   point_size: 1,
#   // base size before aes modifications.
#   alpha: 40,
#   // Default screen saturation target.
#   background_options: default_background_options,
#   zoom_align: "center"
# };


bg_color = st.sidebar.color_picker("background_color", "#EEEDDE")
prefs["background_color"] = bg_color
prefs["point_size"] = st.sidebar.slider("point_size", 0.5, 5.0, 2.0, 0.5) # Default point size before application of size scaling
prefs["max_points"] = st.sidebar.number_input("max_points", 1000, 1000000, 1000000,step=1000)

# Target saturation for the full page.
prefs["alpha"] = st.sidebar.slider("alpha", 0, 100, 35,step=5)
# Duration of transitions
prefs["duration"] = st.sidebar.slider("duration", 0, 1000, 500)

# Rate at which points increase size. https:#observablehq.com/@bmschmidt/zoom-strategies-for-huge-scatterplots-with-three-js
prefs["zoom_balance"] = st.sidebar.slider("zoom_balance", 0.0, 1.0, 0.22, 0.01)
prefs["zoom_align"] = st.sidebar.selectbox("zoom_align", ["center", "left", "right"])


x_column = "x"
y_column = "y"
if x_column not in df.columns:
    x_column = st.sidebar.selectbox("x", df.columns, placeholder="x")
    if x_column and x_column in df.columns:
        encoding["x"]["field"] = x_column
if y_column not in df.columns:
    y_column = st.sidebar.selectbox("y", df.columns, placeholder="y")
    if y_column and y_column in df.columns:
        encoding["y"]["field"] = y_column

df_cols=set(df.columns)-set([y_column, x_column])

use_color = st.sidebar.checkbox("Enable color")
if use_color:
    color_option = {}
    color_column = st.sidebar.selectbox("color", df_cols, placeholder="shop_id")
    if df[color_column].dtype == "object":
        color_option["domain"] = df[color_column].unique()
    else:
        color_option["domain"] = [int(df[color_column].min()), int(df[color_column].max())]

    color_range = st.sidebar.selectbox(
        "color range:", ["okabe", "category10", "category20", "category20b", "category20c"]
    )
    color_transform = st.sidebar.selectbox("transform", ["linear", "log","sqrt"])
    if color_column and color_column in df.columns:
        color_option["field"] = color_column
        color_option["range"] = color_range
        color_option["domain"] = [int(df[color_column].min()), int(df[color_column].max())]
        color_option["transform"] = color_transform  # 'log' or 'linear'
        encoding["color"] = color_option

use_size = st.sidebar.checkbox("Enable size")
if use_size:
    size_option = {}
    size_column = st.sidebar.selectbox("size", df_cols, placeholder="size")
    st.write(df[size_column].dtype)
    if df[size_column].dtype == "object":
        size_option["domain"] = df[size_column].unique()
        st.write(size_option["domain"])
    else:
        size_option["domain"] = [int(df[size_column].min()), int(df[size_column].max())]
    size_range = st.sidebar.slider("range", 0.5, 5.0,(2.0,5.0),0.5)
    st.write(size_range)
    if size_column and size_column in df.columns:
        size_option["field"] = size_column
        size_option["range"] = list(size_range)
        encoding["size"] = size_option

use_filter = st.sidebar.checkbox("Enable filter")
if use_filter:
    filter_option = {}
    filter_column = st.sidebar.selectbox("filter", df_cols, placeholder="filter")
    filter_op = st.sidebar.selectbox("operation", ["eq",  "lt", "gt", "between", "within"])
    filter_value_a = st.sidebar.text_input("a")
    if filter_op in ["within",'between']:
        filter_value_b = st.sidebar.text_input("b")
        filter_option["b"] = filter_value_b
    if filter_column and filter_column in df.columns:
        filter_option["field"] = filter_column
        filter_option["op"] = filter_op
        filter_option["a"] = filter_value_a
        encoding["filter"] = filter_option


excluded_columns = ["site_id"]


    
arrow_table = df.to_arrow()
# prefs['zoom']={"bbox":{"x":[-12.196905455436436,19.045251908254468],"y":[-2.943801298144175,6.5378853069212655]}}

# if "zoom_state" not in st.session_state:
#     st.session_state["zoom_state"] = None
# else:
#     prefs["zoom"] = {"bbox": st.session_state["zoom_state"]}

if 'rerun_count' not in st.session_state:
    st.session_state['rerun_count'] = 0
else:
    st.session_state['rerun_count'] += 1
st.write(st.session_state['rerun_count'])
# st.write(st.session_state)

# if "python_side_rerun" not in st.session_state:
#     st.session_state["python_side_rerun"] = True


# def on_plot_change(x=None):
#     st.write(f"plot changed callback {st.session_state}")
#     st.session_state["python_side_rerun"] = False

# st.write(st.session_state["python_side_rerun"])
# if "is_initialized" not in st.session_state:
#     st.session_state["is_initialized"] = False
# else:
#     st.session_state["is_initialized"] = True
#     st.write("is_initialized")


@st.fragment
def plot_scatter():
    cols = st.columns(3)
    with cols[0]:


        plot_state = st_deepscatter(encoding=encoding,
                                    arrow_table=arrow_table,
                                    id_column="row_id",
                                    exclude_columns=None,
                                    container_height=400,
                                    lasso_mode=lasso_mode,
                                    show_tooltip=True,
                                    key="my_deepscatter",
                                    #    on_change=on_plot_change,
                                    **prefs)
        st.session_state['zoom_to']= None
        # prefs["zoom"] = None
        if plot_state:
            if "zoom_state" in plot_state and plot_state["zoom_state"]:
                st.session_state["zoom_state"]=plot_state["zoom_state"]
            if "selected_points" in plot_state:
                st.session_state["selected_points"] = plot_state["selected_points"]
            if "lassos" in plot_state:
                st.session_state["lassos"] = plot_state['lassos']
            if "selected_lassos_list" in plot_state:
                st.session_state["selected_lassos"] = plot_state['selected_lassos_list']
            if "hovered_point" in plot_state:
                st.session_state["hovered_point"]=plot_state["hovered_point"]

        st.write(st.session_state)

    with cols[1]:
        if "selected_lassos" in st.session_state and st.session_state["selected_lassos"]:
            selected_lassos = st.session_state["selected_lassos"]
            st.write(f"selected_lassos:{selected_lassos}")
        if "lassos" in st.session_state and st.session_state["lassos"]:
            lassos = st.session_state["lassos"]
            for lasso_id in lassos:
                st.checkbox(lasso_id, value=(lasso_id in selected_lassos))
                st.write(lassos[lasso_id]["point_count"])
    with cols[2]:
        if "hovered_point" in st.session_state and st.session_state["hovered_point"]:
            st.write("hovered_point:")
            st.write(st.session_state["hovered_point"])
        
        if "selected_points" in st.session_state:
            st.write("selected_points:")
            st.write(pl.DataFrame(st.session_state["selected_points"]))
    

if "zoom_state" in st.session_state:
    st.session_state["zoom_to"] = st.session_state["zoom_state"].copy()
if "zoom_to" in st.session_state and st.session_state["zoom_to"]:
    prefs["zoom"] = {"bbox": st.session_state["zoom_to"]}
    prefs["duration"] = 0



# def on_lasso_change():
#     if "zoom_state" in st.session_state:
#         st.session_state["zoom_to"] = st.session_state["zoom_state"].copy()

lasso_mode = st.checkbox("lasso")



plot_scatter()



