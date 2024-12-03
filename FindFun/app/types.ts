// types.ts
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type AccountStackParamList = {
    AccountPage: undefined;
    SavedItineraries: undefined;
};

export type AccountPageNavigationProp = StackNavigationProp<
    AccountStackParamList,
    'AccountPage'
>;

export type SavedItinerariesNavigationProp = StackNavigationProp<
    AccountStackParamList,
    'SavedItineraries'
>;

export type AccountPageRouteProp = RouteProp<
    AccountStackParamList,
    'AccountPage'
>;

