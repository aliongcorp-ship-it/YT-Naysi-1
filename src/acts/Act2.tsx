import React from 'react';
import type {Act} from '../timeline';
import {Scene} from './Scene';
export const Act2: React.FC<{act: Act}> = ({act}) => <Scene act={act}/>;
