import os
from typing import Dict, List

import streamlit.components.v1 as components

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)
_RELEASE = False

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _st_deepscatter = components.declare_component(
        # We give the component a simple, descriptive name ("my_component"
        # does not fit this bill, so please choose something better for your
        # own component :)
        "st_deepscatter",
        # Pass `url` here to tell Streamlit that the component will be served
        # by the local dev server that you run via `npm run start`.
        # (This is useful while your component is in development.)
        url="http://localhost:5173",
    )
else:
    # When we're distributing a production version of the component, we'll
    # replace the `url` param with `path`, and point it to the component's
    # build directory:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/dist")
    _st_deepscatter = components.declare_component(
        "st_deepscatter",
        path=build_dir
    )


# exclude_columns excludes it from being show in the tooltip
def st_deepscatter(
    encoding: Dict,
    source_url: str = None,
    arrow_table=None,
    id_column: str = "id",
    select_ids: Dict[str,List]= None,
    # selected_lassos=None,
    container_height=500,
    max_points=1000000,
    alpha=35,
    zoom_align="center",
    zoom_balance=0.22,
    duration=500,
    point_size=2,
    background_color="#EEEDDE",
    background_options="#EEEDDE",
    click_function=None,
    zoom=None,
    labels=None,
    lasso_mode=False,
    show_tooltip: bool = True,
    return_hovered_point: bool = False,
    exclude_columns: List[str] = None,
    on_change=None,
    initial_run=True,
    key=None,
):
    
    prefs = {
            "max_points": max_points,
            "alpha": alpha,
            "zoom_align": zoom_align,
            "zoom_balance": zoom_balance,
            "duration": duration,
            "point_size": point_size,
            "background_color": background_color,
            "click_function": click_function,
            "encoding": encoding
        }    
    if zoom is not None:
        prefs["zoom"]=zoom
    if labels is not None:
        prefs["labels"]=labels

    if initial_run:
        assert (source_url is not None or arrow_table is not None), "One of source_url or arrow_table is required"

        if arrow_table is not None:
            assert encoding["x"]["field"] in arrow_table.column_names, "x field is required in encoding"
            assert encoding["y"]["field"] in arrow_table.column_names, "y field is required in encoding"
            if "color" in encoding:
                assert encoding["color"]["field"] in arrow_table.column_names, "color field is required in encoding"
            if 'filter' in encoding:
                assert encoding['filter']['field'] in arrow_table.column_names, "filter field is required in encoding"
        else:
            prefs["source_url"]=source_url

            # x = arrow_table['x'].tolist()
            # y = arrow_table['y'].tolist()
    else:
        arrow_table = None


    component_value = _st_deepscatter(prefs=prefs,arrow_table=arrow_table,
                                    id_column=id_column,
                                    select_ids=select_ids,
                                    #   selected_lassos=selected_lassos,
                                    height=container_height,
                                    lasso_mode=lasso_mode,
                                    show_tooltip=show_tooltip,
                                    return_hovered_point=return_hovered_point,
                                    exclude_columns=exclude_columns,
                                    on_change=on_change,
                                    key=key)


    # We could modify the value returned from the component if we wanted.
    # There's no need to do this in our simple example - but it's an option.
    return component_value
