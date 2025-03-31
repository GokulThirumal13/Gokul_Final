import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomePage from './Home';
import NewStoryPrompt from './createnewstory';
import LoginScreen from './Login';
import ForgotPassword from './ForgotPassword';
import SettingsScreen from './SettingScreen'
import Onboarding from './OnBoardingScreen'
import SuggestionsScreen from './Suggestion';
const Stack = createStackNavigator();

export default function App() {
  return (

    
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" component={Onboarding}/>
         <Stack.Screen name="Home" component={HomePage}/> 
         <Stack.Screen name="CreateStory" component={NewStoryPrompt}/>
         <Stack.Screen name="Login" component={LoginScreen}/>
         <Stack.Screen name="ForgotPassword" component={ForgotPassword}/>
         <Stack.Screen name="Setting" component={SettingsScreen}/>
         <Stack.Screen name="suggestion" component={SuggestionsScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
