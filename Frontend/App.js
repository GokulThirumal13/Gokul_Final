import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileSelection from './sections';
import KidsSection from './Kidssection';
import LoginScreen from './Login';
import NewStoryPrompt from './createnewstory';
import KidsHomeScreen from './kidshome';
import ProfileScreen from './ProfileScreen';
import SubscriptionPage from './sub';
import AdultsHomeScreen from './AdultsHomeScreen';
import NewStoryPromptAdults from './createnewstoryadult';
import AdultsSection from './adultssection';

// import HomePage from './Home';
// import NewStoryPrompt from './createnewstory';
// import LoginScreen from './Login';
// import ForgotPassword from './ForgotPassword';
// import SettingsScreen from './SettingScreen'
// import Onboarding from './OnBoardingScreen'
// import SuggestionsScreen from './Suggestion';
// import RecentStories from './recent';
// import FavoritesPage from './Fav';
// import Mt from './mqtt';
// import ProfileScreen from './ProfileScreen';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='sub' component={SubscriptionPage}/>
      <Stack.Screen name='pages' component={ProfileSelection}/>
      <Stack.Screen name='Adults' component={AdultsHomeScreen}/>
      <Stack.Screen name="Login" component={LoginScreen}/>
       <Stack.Screen name="CreateStory" component={NewStoryPrompt}/> 
       <Stack.Screen name="khome" component={KidsHomeScreen}/>
       <Stack.Screen name='kids' component={KidsSection}/>
       <Stack.Screen name="profile" component={ProfileScreen}/> 
       <Stack.Screen name='createadultstory' component={NewStoryPromptAdults}/>
      <Stack.Screen name='asection' component={AdultsSection}/>
       {/* <Stack.Screen name='sub' component={SubscriptionPage}/> */}
      {/* <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name='pages' component={ProfileSelection}/>
        <Stack.Screen name="khome" component={KidsHomeScreen}/>
        <Stack.Screen name='kids' component={KidsSection}/>
        <Stack.Screen name="CreateStory" component={NewStoryPrompt}/>
        <Stack.Screen name="profile" component={ProfileScreen}/>   */}
         {/* <Stack.Screen name="onboarding" component={Onboarding}/>
         <Stack.Screen name="Home" component={HomePage}/> 
         <Stack.Screen name="CreateStory" component={NewStoryPrompt}/>
         <Stack.Screen name="Login" component={LoginScreen}/>
         <Stack.Screen name="ForgotPassword" component={ForgotPassword}/>
         <Stack.Screen name="Setting" component={SettingsScreen}/>
         <Stack.Screen name="suggestion" component={SuggestionsScreen}/>
         <Stack.Screen name="recent" component={RecentStories}/>
         <Stack.Screen name="fav" component={FavoritesPage}/> 
         <Stack.Screen name="mq" component={Mt}/>
        
          */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
