import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Minus, Save } from 'lucide-react';

// Define color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FreelancerCostCalculator() {
  // State for project data
  const [projectData, setProjectData] = useState({
    projectName: 'New Project',
    clientBudget: 10000,
    expectedDuration: 2, // months
    internalCosts: 2000,
    overheadPercentage: 20
  });

  // State for freelancers
  const [freelancers, setFreelancers] = useState([
    { id: 1, name: 'Designer', hourlyRate: 50, hoursPerWeek: 20, weeks: 4 },
    { id: 2, name: 'Developer', hourlyRate: 65, hoursPerWeek: 15, weeks: 6 }
  ]);

  // State for chart type
  const [chartType, setChartType] = useState('pie');

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    totalFreelancerCost: 0,
    totalCost: 0,
    grossProfit: 0,
    margin: 0,
    monthlyBreakdown: []
  });

  // Calculate all values when inputs change
  useEffect(() => {
    // Calculate freelancer costs
    const totalFreelancerCost = freelancers.reduce((total, freelancer) => {
      return total + (freelancer.hourlyRate * freelancer.hoursPerWeek * freelancer.weeks);
    }, 0);

    // Calculate overhead cost
    const overheadCost = projectData.clientBudget * (projectData.overheadPercentage / 100);

    // Calculate total cost
    const totalCost = totalFreelancerCost + projectData.internalCosts + overheadCost;

    // Calculate gross profit
    const grossProfit = projectData.clientBudget - totalCost;

    // Calculate margin percentage
    const margin = (grossProfit / projectData.clientBudget) * 100;

    // Create monthly breakdown
    const durationMonths = projectData.expectedDuration;
    const monthlyBreakdown = [];
    
    // Calculate average monthly cost distribution
    const monthlyFreelancerCost = totalFreelancerCost / durationMonths;
    const monthlyInternalCost = projectData.internalCosts / durationMonths;
    const monthlyOverheadCost = overheadCost / durationMonths;
    const monthlyRevenue = projectData.clientBudget / durationMonths;
    
    for (let i = 1; i <= durationMonths; i++) {
      monthlyBreakdown.push({
        month: `Month ${i}`,
        freelancerCost: monthlyFreelancerCost,
        internalCost: monthlyInternalCost,
        overheadCost: monthlyOverheadCost,
        revenue: monthlyRevenue,
        profit: monthlyRevenue - monthlyFreelancerCost - monthlyInternalCost - monthlyOverheadCost
      });
    }

    setCalculatedValues({
      totalFreelancerCost,
      totalCost,
      grossProfit,
      margin,
      monthlyBreakdown
    });
  }, [freelancers, projectData]);

  // Generate cost breakdown data for pie chart
  const costBreakdownData = [
    { name: 'Freelancers', value: calculatedValues.totalFreelancerCost },
    { name: 'Internal Costs', value: projectData.internalCosts },
    { name: 'Overhead', value: projectData.clientBudget * (projectData.overheadPercentage / 100) }
  ];

  // Generate freelancer breakdown data
  const freelancerBreakdownData = freelancers.map(freelancer => ({
    name: freelancer.name,
    value: freelancer.hourlyRate * freelancer.hoursPerWeek * freelancer.weeks
  }));

  // Add a new freelancer
  const addFreelancer = () => {
    const newId = freelancers.length > 0 ? Math.max(...freelancers.map(f => f.id)) + 1 : 1;
    setFreelancers([...freelancers, {
      id: newId,
      name: `Freelancer ${newId}`,
      hourlyRate: 50,
      hoursPerWeek: 20,
      weeks: 4
    }]);
  };

  // Remove a freelancer
  const removeFreelancer = (id) => {
    setFreelancers(freelancers.filter(freelancer => freelancer.id !== id));
  };

  // Update freelancer data
  const updateFreelancer = (id, field, value) => {
    const updatedFreelancers = freelancers.map(freelancer => {
      if (freelancer.id === id) {
        return { ...freelancer, [field]: field === 'name' ? value : Number(value) };
      }
      return freelancer;
    });
    setFreelancers(updatedFreelancers);
  };

  // Update project data
  const updateProjectData = (field, value) => {
    setProjectData({
      ...projectData,
      [field]: field === 'projectName' ? value : Number(value)
    });
  };

  // Render the appropriate chart based on chartType
  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costBreakdownData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {costBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculatedValues.monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="freelancerCost" name="Freelancer Costs" fill="#0088FE" />
              <Bar dataKey="internalCost" name="Internal Costs" fill="#00C49F" />
              <Bar dataKey="overheadCost" name="Overhead" fill="#FFBB28" />
              <Bar dataKey="profit" name="Profit" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={calculatedValues.monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">{projectData.projectName} - Financial Forecast</h1>
      
      {/* Project Information Section */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md p-2"
              value={projectData.projectName}
              onChange={(e) => updateProjectData('projectName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Budget ($)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md p-2"
              value={projectData.clientBudget}
              onChange={(e) => updateProjectData('clientBudget', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md p-2"
              value={projectData.expectedDuration}
              onChange={(e) => updateProjectData('expectedDuration', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Costs ($)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md p-2"
              value={projectData.internalCosts}
              onChange={(e) => updateProjectData('internalCosts', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overhead Percentage (%)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md p-2"
              value={projectData.overheadPercentage}
              onChange={(e) => updateProjectData('overheadPercentage', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Freelancer Section */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Freelancer Costs</h2>
          <button 
            onClick={addFreelancer}
            className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add Freelancer
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Name</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Hourly Rate ($)</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Hours per Week</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Weeks</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Total Cost</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {freelancers.map(freelancer => (
                <tr key={freelancer.id}>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md p-1"
                      value={freelancer.name}
                      onChange={(e) => updateFreelancer(freelancer.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md p-1"
                      value={freelancer.hourlyRate}
                      onChange={(e) => updateFreelancer(freelancer.id, 'hourlyRate', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md p-1"
                      value={freelancer.hoursPerWeek}
                      onChange={(e) => updateFreelancer(freelancer.id, 'hoursPerWeek', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md p-1"
                      value={freelancer.weeks}
                      onChange={(e) => updateFreelancer(freelancer.id, 'weeks', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 font-medium">
                    ${(freelancer.hourlyRate * freelancer.hoursPerWeek * freelancer.weeks).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200">
                    <button 
                      onClick={() => removeFreelancer(freelancer.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md flex items-center"
                    >
                      <Minus size={16} className="mr-1" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Total Revenue</h3>
            <p className="text-2xl font-bold">${projectData.clientBudget.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-amber-800">Total Costs</h3>
            <p className="text-2xl font-bold">${calculatedValues.totalCost.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Freelancers: ${calculatedValues.totalFreelancerCost.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Gross Profit</h3>
            <p className="text-2xl font-bold">${calculatedValues.grossProfit.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-lg ${calculatedValues.margin >= 20 ? 'bg-green-50' : calculatedValues.margin >= 10 ? 'bg-amber-50' : 'bg-red-50'}`}>
            <h3 className="text-lg font-medium text-gray-800">Profit Margin</h3>
            <p className={`text-2xl font-bold ${calculatedValues.margin >= 20 ? 'text-green-600' : calculatedValues.margin >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
              {calculatedValues.margin.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Visualizations</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 rounded-md flex items-center ${chartType === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Cost Breakdown
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-md flex items-center ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Monthly Costs
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-md flex items-center ${chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Revenue & Profit
            </button>
          </div>
        </div>
        
        {renderChart()}
      </div>
      
      {/* Monthly Breakdown Table */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Month</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Revenue</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Freelancer Costs</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Internal Costs</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Overhead</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Profit</th>
                <th className="text-left px-4 py-2 border-b-2 border-gray-200">Margin</th>
              </tr>
            </thead>
            <tbody>
              {calculatedValues.monthlyBreakdown.map((month, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border-b border-gray-200">{month.month}</td>
                  <td className="px-4 py-2 border-b border-gray-200">${month.revenue.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b border-gray-200">${month.freelancerCost.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b border-gray-200">${month.internalCost.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b border-gray-200">${month.overheadCost.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b border-gray-200 font-medium">${month.profit.toFixed(2)}</td>
                  <td className={`px-4 py-2 border-b border-gray-200 font-medium ${
                    (month.profit / month.revenue) * 100 >= 20 ? 'text-green-600' : 
                    (month.profit / month.revenue) * 100 >= 10 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {((month.profit / month.revenue) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Export/Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
          <Save size={18} className="mr-2" /> Save Forecast
        </button>
      </div>
    </div>
  );
}