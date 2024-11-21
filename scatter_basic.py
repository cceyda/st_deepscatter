import polars as pl
import pyarrow as pa  # Import pyarrow
import pyarrow.parquet as pq
import streamlit as st
from st_deepscatter import st_deepscatter

st.set_page_config(layout="wide")

@st.cache_data
def load_data():
    df = pl.read_csv("data/example.csv")#.head(65536*4)
    arrow_table = df.to_arrow()
    return arrow_table,df

arrow_table,df = load_data()

prefs = {}

encoding = {
   
    "x": {
        "field": "x",
        "transform": "literal",
    },
    "y": {
        "field": "y",
        "transform": "literal",
    },
 
}

def reinit():
    st.session_state['ready'] = False 

prefs["background_color"] = st.sidebar.color_picker("background_color", "#EEEDDE", on_change=reinit)
prefs["point_size"] = st.sidebar.slider("point_size", 0.5, 5.0, 2.0, 0.5) # Default point size before application of size scaling
prefs["max_points"] = st.sidebar.number_input("max_points", 1000, 1000000, 1000000,step=1000)

# Target saturation for the full page.
prefs["alpha"] = st.sidebar.slider("alpha", 0, 100, 35,step=5)
# Duration of transitions
prefs["duration"] = st.sidebar.slider("duration", 0, 1000, 500)

# Rate at which points increase size. https:#observablehq.com/@bmschmidt/zoom-strategies-for-huge-scatterplots-with-three-js
prefs["zoom_balance"] = st.sidebar.slider("zoom_balance", 0.0, 1.0, 0.22, 0.01)
prefs["zoom_align"] = st.sidebar.selectbox("zoom_align", ["center", "left", "right"])



if 'ready' not in st.session_state:
    st.session_state['ready'] = False

lasso_mode = st.checkbox("lasso", False)
plot_state = st_deepscatter(encoding=encoding,
                                arrow_table=arrow_table,
                                # id_column="index",
                                select_ids=None,
                                # selected_lassos=None, # Can't do this now because it redraws at every update
                                exclude_columns=None,
                                container_height=400,
                                lasso_mode=lasso_mode,
                                return_hovered_point=False, # Can slow down streamlit if the datasize is big
                                show_tooltip=True,
                                initial_run=not st.session_state['ready'],
                                key="my_deepscatter",
                                #    on_change=on_plot_change,
                                **prefs)

if plot_state and 'ready' in plot_state:
    st.session_state['ready'] = plot_state['ready']
