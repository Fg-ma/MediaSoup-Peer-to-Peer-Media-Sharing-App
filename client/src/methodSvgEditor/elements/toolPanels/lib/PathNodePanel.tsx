import React from "react";

export default function PathNodePanel() {
  return (
    <div id='path_node_panel' className='context_panel clearfix'>
      <h4 className='!font-Josefin'>Edit Path</h4>

      <div className='draginputs'>
        <label id='tool_node_x'>
          <input
            id='path_node_x'
            className='attr_changer'
            data-title="Change node's x coordinate"
            data-attr='x'
          />
          <span className='!font-Josefin'>X</span>
        </label>
        <label id='tool_node_y'>
          <input
            id='path_node_y'
            className='attr_changer'
            data-title="Change node's y coordinate"
            data-attr='y'
          />
          <span className='!font-Josefin'>Y</span>
        </label>

        <div id='segment_type' className='draginput label'>
          <span className='!font-Josefin'>Seg Type</span>
          <select
            id='seg_type'
            data-title='Change Segment type'
            defaultValue='4'
          >
            <option id='straight_segments' value='4'>
              Straight
            </option>
            <option id='curve_segments' value='6'>
              Curve
            </option>
            <option id='curve_segments' value='7'>
              Smooth
            </option>
            <option id='curve_segments' value='8'>
              Symmetric
            </option>
            <option id='curve_segments' value='9'>
              Auto-smooth
            </option>
          </select>
          <div className='caret'></div>
          <label id='seg_type_label'>Straight</label>
        </div>
      </div>

      <div className='button-container clearfix'>
        <div className='button full' id='tool_node_clone' title='Adds a node'>
          Add Node
        </div>
        <div className='button full' id='tool_node_delete' title='Delete Node'>
          Delete Node
        </div>
        <div
          className='button full'
          id='tool_openclose_path'
          title='Open/close sub-path'
        >
          Open/close Path
        </div>
      </div>
    </div>
  );
}
