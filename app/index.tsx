import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';

export default function IndexScreen() {
  const { onboardingComplete, isLoading } = useAppState();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  if (onboardingComplete) {
    console.log('Index: Redirecting to tabs');
    return <Redirect href={"/(tabs)/today" as any} />;
  }

  console.log('Index: Redirecting to onboarding');
  return <Redirect href={"/onboarding/welcome" as any} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
