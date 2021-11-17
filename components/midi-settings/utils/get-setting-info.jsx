import React from 'react'
import { settingTooltipMap } from '../constants/setting-tooltip-map'

export const getSettingInfo = (settingCategory, groupId) => {
  return settingTooltipMap[settingCategory][groupId];
}