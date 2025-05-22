<?php

namespace App\Models;

use CodeIgniter\Model;

class SaleModel extends Model
{
    protected $table = 'sales';
    protected $primaryKey = 'sale_id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = ['total_amount', 'sale_date'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Get daily sales with detailed summary
    public function getDailySales($date)
    {
        $db = \Config\Database::connect();
        
        // Get summary
        $summary = $db->table('sales s')
            ->select([
                'COUNT(*) as total_transactions',
                'SUM(total_amount) as total_sales',
                'AVG(total_amount) as average_sale',
                'MIN(total_amount) as min_sale',
                'MAX(total_amount) as max_sale'
            ])
            ->where('DATE(sale_date)', $date)
            ->get()
            ->getRowArray();

        // Get top selling products
        $topProducts = $db->table('sale_items si')
            ->select([
                'p.name',
                'p.category',
                'SUM(si.quantity) as total_quantity',
                'SUM(si.subtotal) as total_revenue'
            ])
            ->join('sales s', 's.sale_id = si.sale_id')
            ->join('products p', 'p.product_id = si.product_id')
            ->where('DATE(s.sale_date)', $date)
            ->groupBy('p.product_id')
            ->orderBy('total_quantity', 'DESC')
            ->limit(5)
            ->get()
            ->getResultArray();

        // Get hourly sales distribution
        $hourlyDistribution = $db->table('sales')
            ->select([
                'HOUR(sale_date) as hour',
                'COUNT(*) as transactions',
                'SUM(total_amount) as total'
            ])
            ->where('DATE(sale_date)', $date)
            ->groupBy('HOUR(sale_date)')
            ->orderBy('hour', 'ASC')
            ->get()
            ->getResultArray();

        return [
            'date' => $date,
            'summary' => $summary,
            'top_products' => $topProducts,
            'hourly_distribution' => $hourlyDistribution,
            'transactions' => $this->where('DATE(sale_date)', $date)->findAll()
        ];
    }

    // Get weekly sales with summary
    public function getWeeklySales($startDate, $endDate)
    {
        $db = \Config\Database::connect();
        
        // Get daily breakdown
        $dailyBreakdown = $db->table('sales')
            ->select([
                'DATE(sale_date) as date',
                'COUNT(*) as transactions',
                'SUM(total_amount) as total_sales'
            ])
            ->where('sale_date >=', $startDate)
            ->where('sale_date <=', $endDate)
            ->groupBy('DATE(sale_date)')
            ->orderBy('date', 'ASC')
            ->get()
            ->getResultArray();

        // Get category performance
        $categoryPerformance = $db->table('sale_items si')
            ->select([
                'p.category',
                'SUM(si.quantity) as total_quantity',
                'SUM(si.subtotal) as total_revenue'
            ])
            ->join('sales s', 's.sale_id = si.sale_id')
            ->join('products p', 'p.product_id = si.product_id')
            ->where('s.sale_date >=', $startDate)
            ->where('s.sale_date <=', $endDate)
            ->groupBy('p.category')
            ->orderBy('total_revenue', 'DESC')
            ->get()
            ->getResultArray();

        // Get overall summary
        $summary = $db->table('sales')
            ->select([
                'COUNT(*) as total_transactions',
                'SUM(total_amount) as total_sales',
                'AVG(total_amount) as average_sale'
            ])
            ->where('sale_date >=', $startDate)
            ->where('sale_date <=', $endDate)
            ->get()
            ->getRowArray();

        return [
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'summary' => $summary,
            'daily_breakdown' => $dailyBreakdown,
            'category_performance' => $categoryPerformance
        ];
    }

    // Get monthly sales with detailed analysis
    public function getMonthlySales($year, $month)
    {
        $db = \Config\Database::connect();
        
        // Get daily breakdown
        $dailyBreakdown = $db->table('sales')
            ->select([
                'DAY(sale_date) as day',
                'COUNT(*) as transactions',
                'SUM(total_amount) as total_sales'
            ])
            ->where('YEAR(sale_date)', $year)
            ->where('MONTH(sale_date)', $month)
            ->groupBy('DAY(sale_date)')
            ->orderBy('day', 'ASC')
            ->get()
            ->getResultArray();

        // Get product performance
        $productPerformance = $db->table('sale_items si')
            ->select([
                'p.name',
                'p.category',
                'SUM(si.quantity) as total_quantity',
                'SUM(si.subtotal) as total_revenue',
                'COUNT(DISTINCT s.sale_id) as appearance_in_transactions'
            ])
            ->join('sales s', 's.sale_id = si.sale_id')
            ->join('products p', 'p.product_id = si.product_id')
            ->where('YEAR(s.sale_date)', $year)
            ->where('MONTH(s.sale_date)', $month)
            ->groupBy('p.product_id')
            ->orderBy('total_revenue', 'DESC')
            ->get()
            ->getResultArray();

        // Get summary
        $summary = $db->table('sales')
            ->select([
                'COUNT(*) as total_transactions',
                'SUM(total_amount) as total_sales',
                'AVG(total_amount) as average_sale',
                'MIN(total_amount) as min_sale',
                'MAX(total_amount) as max_sale'
            ])
            ->where('YEAR(sale_date)', $year)
            ->where('MONTH(sale_date)', $month)
            ->get()
            ->getRowArray();

        return [
            'period' => [
                'year' => $year,
                'month' => $month
            ],
            'summary' => $summary,
            'daily_breakdown' => $dailyBreakdown,
            'product_performance' => $productPerformance
        ];
    }

    // Get sales dashboard data (for real-time monitoring)
    public function getDashboardData()
    {
        $db = \Config\Database::connect();
        $today = date('Y-m-d');
        
        // Today's summary
        $todaySummary = $db->table('sales')
            ->select([
                'COUNT(*) as transactions',
                'SUM(total_amount) as total_sales'
            ])
            ->where('DATE(sale_date)', $today)
            ->get()
            ->getRowArray();

        // This week's summary
        $weekStart = date('Y-m-d', strtotime('-6 days'));
        $weekSummary = $db->table('sales')
            ->select([
                'COUNT(*) as transactions',
                'SUM(total_amount) as total_sales'
            ])
            ->where('sale_date >=', $weekStart)
            ->where('sale_date <=', $today)
            ->get()
            ->getRowArray();

        // This month's summary
        $monthStart = date('Y-m-01');
        $monthSummary = $db->table('sales')
            ->select([
                'COUNT(*) as transactions',
                'SUM(total_amount) as total_sales'
            ])
            ->where('sale_date >=', $monthStart)
            ->where('sale_date <=', $today)
            ->get()
            ->getRowArray();

        return [
            'today' => $todaySummary,
            'this_week' => $weekSummary,
            'this_month' => $monthSummary
        ];
    }
} 