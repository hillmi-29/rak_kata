'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart2,
  Clock,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/layout/admin-layout';
import { cn, formatPrice } from '@/lib/format';
import type { AdminStats, Order } from '@/lib/types';
import { OrderStatusBadge } from '@/components/ui/status-badge';

const sparklineData = [
  [12, 19, 15, 25, 22, 30, 28],
  [18, 22, 19, 28, 25, 35, 32],
  [8, 12, 10, 15, 13, 18, 16],
  [22, 18, 20, 24, 21, 28, 25],
  [15, 20, 18, 25, 22, 30, 28],
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [chartData, setChartData] = useState<Array<{ date: string; revenue: number; orders: number }>>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<AdminStats>('/admin/stats/overview'),
      api.get<Order[]>('/admin/orders?limit=5'),
    ])
      .then(([statsResponse, ordersResponse]) => {
        if (!active) return;
        setStats(statsResponse.data);
        setRecentOrders(ordersResponse.data);
        generateChartData(statsResponse.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const generateChartData = (stats: AdminStats) => {
    const days = chartPeriod === 'daily' ? 7 : chartPeriod === 'weekly' ? 30 : 90;
    const base = stats.totalRevenue / days;
    const data = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.round(base * (0.7 + Math.random() * 0.6)),
      orders: Math.round((stats.totalOrders / days) * (0.7 + Math.random() * 0.6)),
    }));
    setChartData(data);
  };

  useEffect(() => {
    if (stats) generateChartData(stats);
  }, [chartPeriod, stats]);

  const kpis = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Total Pendapatan',
        value: formatPrice(stats.totalRevenue),
        trend: { value: '+12.5%', positive: true },
        icon: Wallet,
        color: 'text-success',
        bg: 'bg-success/10',
      },
      {
        label: 'Total Pesanan',
        value: stats.totalOrders.toLocaleString('id-ID'),
        trend: { value: '+8.2%', positive: true },
        icon: Package,
        color: 'text-info',
        bg: 'bg-info/10',
      },
      {
        label: 'Total Pengguna',
        value: stats.totalUsers.toLocaleString('id-ID'),
        trend: { value: '+3.1%', positive: true },
        icon: Users,
        color: 'text-cherry',
        bg: 'bg-cherry/10',
      },
      {
        label: 'Konversi',
        value: `${stats.conversionRate}%`,
        trend: { value: '-0.4%', positive: false },
        icon: BarChart2,
        color: 'text-warning',
        bg: 'bg-warning/10',
      },
    ];
  }, [stats]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
              Ringkasan toko
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Data diperbarui {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={chartPeriod}
              onChange={e => setChartPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="select w-auto min-w-[140px]"
            >
              <option value="daily">7 Hari</option>
              <option value="weekly">30 Hari</option>
              <option value="monthly">90 Hari</option>
            </select>
            <button type="button" className="btn-ghost btn-sm">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {kpis.map(kpi => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Charts & Tables */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section className="min-w-0 rounded-xl border border-line bg-white/60 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-navy">Tren Pendapatan</h2>
            </div>
            <div className="mt-6 h-[240px] sm:h-[300px]">
              <RevenueChart data={chartData} />
            </div>
          </section>

          <div className="min-w-0 space-y-8">
            <section className="rounded-xl border border-line bg-white/60 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-navy">Buku Terlaris</h2>
                <Link href="/admin/books" className="text-sm font-semibold text-cherry underline-offset-2 hover:underline">
                  Lihat semua
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {stats?.topBooks?.slice(0, 5).map((book, index) => (
                  <TopBookRow key={book.id} book={book} rank={index + 1} />
                )) || Array.from({ length: 5 }).map((_, i) => <TopBookRowSkeleton key={i} />)}
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white/60 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-navy">Kategori Terlaris</h2>
              </div>
              <div className="mt-4 flex min-h-[200px] items-center justify-center">
                <CategoryDonutChart />
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white/60 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-navy">
                  <span className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-cherry" />
                    Stok Menipis
                  </span>
                </h2>
                <Link href="/admin/books?status=low-stock" className="text-sm font-semibold text-cherry underline-offset-2 hover:underline">
                  Lihat semua
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {stats?.lowStockBooks?.slice(0, 5).map((book, index) => (
                  <LowStockRow key={book.id} book={book} rank={index + 1} />
                )) || Array.from({ length: 5 }).map((_, i) => <LowStockRowSkeleton key={i} />)}
              </div>
            </section>
          </div>
        </div>

        {/* Recent Orders */}
        <section className="rounded-xl border border-line bg-white/60 overflow-hidden">
          <div className="border-b border-line px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-navy">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-cherry underline-offset-2 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line bg-cream/50 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                  <th className="px-4 py-3">Pesanan</th>
                  <th className="px-4 py-3 hidden md:table-cell">Pelanggan</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden md:table-cell">Waktu</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted" colSpan={6}>Belum ada pesanan</td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <OrderRow key={order.id} order={order} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function KPICard({
  label,
  value,
  trend,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  trend: { value: string; positive: boolean };
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white/60 p-5 shadow-paper">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
          <p className="mt-2 font-display text-[28px] font-bold text-navy">{value}</p>
        </div>
        <span className={cn('grid h-11 w-11 place-items-center rounded-full', bg, color)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <span className={cn('text-xs font-semibold', trend.positive ? 'text-success' : 'text-danger')}>
          {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value}
        </span>
        <span className="text-xs text-muted">vs periode lalu</span>
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: Array<{ date: string; revenue: number; orders: number }> }) {
  if (data.length === 0) return <div className="h-full flex items-center justify-center text-muted">Memuat grafik...</div>;

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const width = '100%';
  const height = 280;
  const padding = { top: 20, right: 10, bottom: 40, left: 60 };
  const chartWidth = `calc(${width} - ${padding.left}px - ${padding.right}px)`;
  const chartHeight = `${height - padding.top - padding.bottom}px`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 100% ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B3173B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#B3173B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1="0"
            y1={ratio * (height - padding.top - padding.bottom)}
            x2="100%"
            y2={ratio * (height - padding.top - padding.bottom)}
            stroke="#E6DFD3"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
        ))}
        {/* Area */}
        <path
          d={data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = (1 - d.revenue / (maxRevenue || 1)) * (height - padding.top - padding.bottom);
            return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
          }).join(' ') + ` L 100% ${height - padding.top - padding.bottom} L 0% ${height - padding.top - padding.bottom} Z`}
          fill="url(#revenueGradient)"
        />
        {/* Line */}
        <path
          d={data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = (1 - d.revenue / (maxRevenue || 1)) * (height - padding.top - padding.bottom);
            return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
          }).join(' ')}
          stroke="#B3173B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={`${(i / (data.length - 1)) * 100}%`}
            cy={(1 - d.revenue / (maxRevenue || 1)) * (height - padding.top - padding.bottom)}
            r="3"
            fill="#B3173B"
            stroke="#FAF6EF"
            strokeWidth="2"
          />
        ))}
      </g>
      {/* X-axis labels */}
      {[0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor(data.length * 3 / 4), data.length - 1].map(i => (
        <text
          key={i}
          x={`${padding.left + (i / (data.length - 1)) * 100}%`}
          y={height - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#6B6B76"
          fontFamily="system-ui"
        >
          {new Date(data[i].date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
        </text>
      ))}
      {/* Y-axis labels */}
      {[0, 0.5, 1].map(ratio => (
        <text
          key={ratio}
          x={15}
          y={padding.top + (1 - ratio) * (height - padding.top - padding.bottom) + 4}
          textAnchor="end"
          fontSize="10"
          fill="#6B6B76"
          fontFamily="system-ui"
        >
          {formatPrice(Math.round(maxRevenue * ratio))}
        </text>
      ))}
    </svg>
  );
}

function CategoryDonutChart() {
  const categories = [
    { name: 'Fiksi', value: 42, color: '#B3173B' },
    { name: 'Non-Fiksi', value: 28, color: '#2F5D50' },
    { name: 'Bisnis', value: 18, color: '#D9A404' },
    { name: 'Sastra', value: 7, color: '#14213D' },
    { name: 'Lainnya', value: 5, color: '#6B8CAE' },
  ];

  let runningTotal = 0;
  const circles = categories.map(cat => {
    const percentage = cat.value / 100;
    const circumference = 2 * Math.PI * 60;
    const startAngle = -90 + (runningTotal / 100) * 360;
    runningTotal += cat.value;
    return (
      <circle
        key={cat.name}
        cx="90"
        cy="90"
        r="60"
        stroke={cat.color}
        strokeWidth="30"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - circumference * percentage}
        strokeLinecap="round"
        transform={`rotate(${startAngle} 90 90)`}
        style={{ transformOrigin: '90px 90px' }}
      />
    );
  });

  return (
    <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
      <svg width="160" height="160" viewBox="0 0 180 180" className="shrink-0">
        <circle cx="90" cy="90" r="60" stroke="#E6DFD3" strokeWidth="30" fill="none" />
        {circles}
      </svg>
      <ul className="w-full space-y-2 text-sm sm:w-auto">
        {categories.map(cat => (
          <li key={cat.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="font-medium text-navy">{cat.name}</span>
            <span className="ml-auto text-muted">{cat.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopBookRow({ book, rank }: { book: { id: string; title: string; coverColor?: string | null }; rank: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-7 shrink-0 font-display text-sm font-bold text-muted/60">{rank}.</span>
      <div className="w-10 h-14 shrink-0">
        <div className="aspect-[2/3] rounded border border-line" style={{ backgroundColor: book.coverColor || '#B3173B' }} />
      </div>
      <p className="font-medium text-navy truncate">{book.title}</p>
    </div>
  );
}

function TopBookRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="skeleton w-7 h-5" />
      <div className="skeleton w-10 h-14 rounded" />
      <div className="skeleton flex-1 h-5" />
    </div>
  );
}

function LowStockRow({ book, rank }: { book: { id: string; title: string; stock: number; coverColor?: string | null }; rank: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-7 shrink-0 font-display text-sm font-bold text-muted/60">{rank}.</span>
      <div className="w-10 h-14 shrink-0">
        <div className="aspect-[2/3] rounded border border-line" style={{ backgroundColor: book.coverColor || '#B3173B' }} />
      </div>
      <p className="font-medium text-navy truncate flex-1">{book.title}</p>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#A86B00]">
        Stok: {book.stock}
      </span>
    </div>
  );
}

function LowStockRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="skeleton w-7 h-5" />
      <div className="skeleton w-10 h-14 rounded" />
      <div className="skeleton flex-1 h-5" />
      <div className="skeleton w-20 h-6 rounded-full" />
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <tr className="hover:bg-cream/30 transition">
      <td className="px-4 py-3">
        <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-navy hover:text-cherry">
          {order.orderNumber}
        </Link>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div>
          <p className="font-medium text-navy">{order.user?.name || '—'}</p>
          <p className="text-xs text-muted">{order.user?.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell font-semibold text-navy">{formatPrice(order.total)}</td>
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-sm text-muted">
        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/admin/orders/${order.id}`} className="btn-ghost btn-sm">
          Detail
        </Link>
      </td>
    </tr>
  );
}