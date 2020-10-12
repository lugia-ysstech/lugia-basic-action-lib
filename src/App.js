import React from 'react';
import Theme from './actions/change-tabs';

export default () => {
  const Target = Theme.loadView()
  return <Target />;
};
