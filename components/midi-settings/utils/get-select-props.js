import { getValuesRange } from './get-values-range'

export const getSelectProps = ({ param }) => {
  let value;
  let options;
  let getOption;
  const hasOptions = Boolean(param.options?.length);

  if (hasOptions) {
    value = param.options.find((option) => option.id === param.values[0])
      ?.name || null;

    options = param.options
    getOption = (option) => option.name;
  } else {
    value = param.values[0];
    options = getValuesRange(param.min, param.max)
    getOption = (option) => option;
  }

  return { value, options, getOption };
}