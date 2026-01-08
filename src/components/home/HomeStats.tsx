import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HomeStat {
  id: string;
  label: string;
  value: string;
  display_order: number;
}

const HomeStats = () => {
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('home_stats')
        .select('*')
        .eq('is_published', true)
        .order('display_order');
      
      if (error) throw error;
      if (data) setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-10 bg-muted rounded w-20 mx-auto" />
            <div className="h-4 bg-muted rounded w-24 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
      {stats.map((stat) => (
        <div key={stat.id} className="space-y-2">
          <div className="text-3xl md:text-4xl font-bold text-gradient-gold">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default HomeStats;