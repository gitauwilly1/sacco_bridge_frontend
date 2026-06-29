import { ResponsiveContainer } from 'recharts';

export default function ChartWrapper({ children, height = 160 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
