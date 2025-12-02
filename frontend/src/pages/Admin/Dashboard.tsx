import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import {
  TrendingUp,
  Users,
  School,
  Calendar,
  Megaphone,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  MessageSquare,
  FileText,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Sun,
  Moon,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Metrics = {
  totalUsers: number;
  totalClasses: number;
  totalActivites: number;
  totalAnnonces: number;
  totalEleves: number;
  totalNotes: number;
  totalAbsences: number;
  totalMessages: number;
  totalNotifications: number;
  recentGrowth?: number;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/metrics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          params: { period },
        });
        if (res.data?.success) {
          setMetrics(res.data.data);
          setError(null);
        } else {
          setError(res.data?.message || "Erreur lors de la récupération des métriques");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000); // Auto-refresh every 5 minutes
    return () => clearInterval(interval);
  }, [period]);

  const statsCards = [
    {
      title: "Utilisateurs",
      value: metrics?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20",
      change: "+12%",
    },
    {
      title: "Classes",
      value: metrics?.totalClasses || 0,
      icon: <School className="w-6 h-6" />,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20",
      change: "+5%",
    },
    {
      title: "Activités",
      value: metrics?.totalActivites || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20",
      change: "+18%",
    },
    {
      title: "Annonces",
      value: metrics?.totalAnnonces || 0,
      icon: <Megaphone className="w-6 h-6" />,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20",
      change: "+8%",
    },
  ];

  const activityCards = [
    { title: "Messages", value: metrics?.totalMessages || 0, icon: <MessageSquare />, color: "text-blue-500" },
    { title: "Notes", value: metrics?.totalNotes || 0, icon: <FileText />, color: "text-emerald-500" },
    { title: "Absences", value: metrics?.totalAbsences || 0, icon: <Activity />, color: "text-rose-500" },
    { title: "Notifications", value: metrics?.totalNotifications || 0, icon: <Bell />, color: "text-violet-500" },
  ];

  const usersSeries = useMemo(() => {
    const days = period === "week" ? 7 : period === "year" ? 30 : 30;
    const labels = Array.from({ length: days }, (_, i) => dayjs().subtract(days - 1 - i, "day").format("DD MMM"));
    const values = labels.map(() => Math.round(Math.random() * 8));
    return { labels, values };
  }, [period]);

  const contentPie = useMemo(() => {
    const labels = ["Activités", "Annonces", "Autres"];
    const values = [
      metrics?.totalActivites || 0,
      metrics?.totalAnnonces || 0,
      Math.max((metrics?.totalUsers || 0) - ((metrics?.totalActivites || 0) + (metrics?.totalAnnonces || 0)), 0),
    ];
    return { labels, values };
  }, [metrics]);

  const handleRefresh = () => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/metrics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          params: { period },
        });
        if (res.data?.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error("Refresh error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <div className="animate-pulse w-full max-w-6xl">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-center mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                Tableau de bord
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Bienvenue, Administrateur • Dernière mise à jour: {dayjs().format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition-all"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Period Selector */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  aria-label="Période"
                >
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <div
              key={stat.title}
              className={`${stat.bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{stat.change}</span>
                    <span className="text-xs text-gray-500">vs période précédente</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Évolution des utilisateurs</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nouveaux inscrits par jour</p>
                </div>
              </div>
              <button title="Télécharger les données" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="h-72">
              <Line
                data={{
                  labels: usersSeries.labels,
                  datasets: [
                    {
                      label: "Nouveaux utilisateurs",
                      data: usersSeries.values,
                      borderColor: "#3B82F6",
                      backgroundColor: "rgba(59, 130, 246, 0.08)",
                      tension: 0.4,
                      fill: true,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0, 0, 0, 0.05)' },
                      ticks: { color: '#6B7280' },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: '#6B7280' },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <PieChart className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Répartition des contenus</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Distribution par catégorie</p>
                </div>
              </div>
              <button title="Plus d'options" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="h-72 relative">
              <Pie
                data={{
                  labels: contentPie.labels,
                  datasets: [
                    {
                      data: contentPie.values,
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                      ],
                      borderColor: [
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(99, 102, 241)',
                      ],
                      borderWidth: 1,
                      hoverOffset: 15,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        padding: 20,
                        color: '#6B7280',
                        font: { size: 12 },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = Math.round((context.raw as number / total) * 100);
                          return `${context.label}: ${context.raw} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Activity Grid and Bar Chart */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-6">Activités récentes</h3>
              <div className="space-y-4">
                {activityCards.map((activity) => (
                  <div key={activity.title} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
                        {activity.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total cumulé</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-800 dark:text-white">{activity.value}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg">
                    <Activity className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Interactions système</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Comparaison des activités</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Voir tout
                </button>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ["Messages", "Notes", "Absences", "Notifications"],
                    datasets: [
                      {
                        label: "Volume d'activité",
                        data: [
                          metrics?.totalMessages || 0,
                          metrics?.totalNotes || 0,
                          metrics?.totalAbsences || 0,
                          metrics?.totalNotifications || 0,
                        ],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                        ],
                        borderRadius: 8,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                          color: '#6B7280',
                          font: { size: 12 },
                        },
                      },
                      x: {
                        grid: { display: false },
                        ticks: {
                          color: '#6B7280',
                          font: { size: 12 },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Tableau de bord Admin. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Confidentialité
              </button>
              <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Conditions
              </button>
              <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Aide
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}