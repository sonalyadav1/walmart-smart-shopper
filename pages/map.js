// pages/map.js
import dynamic from 'next/dynamic';

const IndoorMapComponent = dynamic(() => import('./IndoorMapComponent'), {
  ssr: false,
});

export default function MapPage() {
  return <IndoorMapComponent />;
}
