import { Redirect } from 'expo-router';

const href = '/today' as const;

export default function TabIndex() {
  return <Redirect href={href as any} />;
}
