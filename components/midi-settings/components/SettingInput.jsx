import Range from '../../Range'
import Select from '../../Select'
import { Switch } from 'antd'
import React from 'react'
import { getSelectProps } from '../utils/get-select-props'

export const SettingInput = ({ onChange, param, group, global }) => {
  switch (param.type) {
    case 'RANGE':
      return (
        <Range
          value={param.values[0]}
          min={param.min}
          max={param.max}
          onChange={(v) => onChange(param, group, v, global)}
        />
      )
    case 'LIST':
    case 'INT': {
     const selectProps = getSelectProps({ param });

      return (
        <Select
          onChange={onChange}
          {...selectProps}
        />
      )
    }
    case 'BOOL':
      return (
        <Switch
          defaultChecked={param.value === 1}
          onChange={(v) => onChange(param, group, v ? 1 : 0, global)}
        />
      )
    default:
      return 'DEF'
  }
}