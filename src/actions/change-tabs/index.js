/**
 *
 * create by grg on 2020/9/8
 *
 * @flow
 */
export default function(params) {
  const {actionComponent, actionParams} = params;
  const { tabs } = actionComponent;
  const { value } = actionParams;
  for (const tab of tabs) {
    tab.activeValue = value;
  }
}

