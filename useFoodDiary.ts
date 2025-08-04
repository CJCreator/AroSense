import { useState, useEffect, useMemo, useCallback } from 'react';
import { FoodLogEntry, LoggedFoodItem, MealType } from '../types';
import * as babyCareService from '../services/babyCareService';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatTime = (date: Date