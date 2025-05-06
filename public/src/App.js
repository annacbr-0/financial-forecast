import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FinancialModel() {
  // Initial state with sample data
  const [projects, setProjects] = useState([
    { id: 1, name: "Website Redesign", revenue: 12000, timeline: 2 },
    { id: 2, name: "Marketing Campaign", revenue: 8500, timeline: 3 },
    { id: 3, name: "App Development", revenue: 25000, timeline: 4 }
  ]);
  
  const [freelancers, setFreelancers] = useState([
    { id: 1, name: "Designer", hourlyRate: 75, hoursPerWeek: 20 },
    { id: 2, name: "Developer", hourlyRate: 90, hoursPerWeek: 30 },
    { id: 3, name: "Copywriter", hourlyRate: 60, hoursPerWeek: 15 }
  ]);
  
  const [projectAssignments, setProjectAssignments] = useState([
    { projectId: 1, freelancerId: 1, weeksAssigned: 2 },
    { projectId: 1, freelancerId: 3, weeksAssigned: 1 },
    { projectId: 2, freelancerId: 1, weeksAssigned: 2 },
    { projectId: 2, freelancerId: 3, weeksAssigned: 3 },
    { projectId: 3, freelancerId: 1, weeksAssigned: 2 },
    { projectId: 3, freelancerId: 2, weeksAssigned: 4 }
  ]);
  
  const [monthlyOverhead, setMonthlyOverhead] = useState(5000);
  const [months, setMonths] = useState(6);
  
  // Form state
  const [newProject, setNewProject] = useState({ name: '', revenue: '', timeline: '' });
  const [newFreelancer, setNewFreelancer] = useState({ name: '', hourlyRate: '', hoursPerWeek: '' });
  const [newAssignment, setNewAssignment] = useState({ projectId: '', freelancerId: '', weeksAssigned: '' });

  // Handle input changes
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
  };
  
  const handleFreelancerChange = (e) => {
    const { name, value } = e.target;
    setNewFreelancer(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
  };
  
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  // Add new project
  const addProject = () => {
    if (newProject.name && newProject.revenue && newProject.timeline) {
      const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
      setProjects([...projects, { ...newProject, id: newId }]);
      setNewProject({ name: '', revenue: '', timeline: '' });
    }
  };
  
  // Add new freelancer
  const addFreelancer = () => {
    if (newFreelancer.name && newFreelancer.hourlyRate && newFreelancer.hoursPerWeek) {
      const newId = freelancers.length > 0 ? Math.max(...freelancers.map(f => f.id)) + 1 : 1;
      setFreelancers([...freelancers, { ...newFreelancer, id: newId }]);
      setNewFreelancer({ name: '', hourlyRate: '', hoursPerWeek: '' });
    }
  };
  
  // Add new assignment
  const addAssignment = () => {
    if (newAssignment.projectId && newAssignment.freelancerId && newAssignment.weeksAssigned) {
      setProjectAssignments([...projectAssignments, { ...newAssignment }]);
      setNewAssignment({ projectId: '', freelancerId: '', weeksAssigned: '' });
    }
  };

  // Calculate freelancer costs per project
  const calculateProjectFreelancerCosts = () => {
    return projects.map(project => {
      const projectAssigns = projectAssignments.filter(pa => pa.projectId === project.id);
      const cost = projectAssigns.reduce((acc, assignment) => {
        const freelancer = freelancers.find(f => f.id === assignment.freelancerId);
        if (freelancer) {
          return acc + (freelancer.hourlyRate * freelancer.hoursPerWeek * assignment.weeksAssigned);
        }
        return acc;
      }, 0);
      
      return {
        ...project,
        freelancerCost: cost,
        profit: project.revenue - cost,
        margin: ((project.revenue - cost) / project.revenue * 100).toFixed(1)
      };
    });
  };
  
  // Get financial projections data
  const getProjectionData = () => {
    const projectedData = [];
    const monthlyProjects = calculateProjectFreelancerCosts();
    
    for (let i = 1; i <= months; i++) {
      // Simple projection: distribute project revenue and costs over months based on timeline
      let monthRevenue = 0;
      let monthCost = 0;
      
      monthlyProjects.forEach(project => {
        // Distribute revenue and costs evenly over project timeline
        if (i <= project.timeline) {
          monthRevenue += project.revenue / project.timeline;
          monthCost += project.freelancerCost / project.timeline;
        }
      });
      
      projectedData.push({
        month: `Month ${i}`,
        revenue: monthRevenue,
        costs: monthCost + monthlyOverhead,
        profit: monthRevenue - (monthCost + monthlyOverhead)
      });
    }
    
    return projectedData;
  };
  
  const projectsWithCosts = calculateProjectFreelancerCosts();
  const projectionData = getProjectionData();
  
  // Calculate totals
  const totalRevenue = projectsWithCosts.reduce((acc, p) => acc + p.revenue, 0);
  const totalCosts = projectsWithCosts.reduce((acc, p) => acc + p.freelancerCost, 0) + (monthlyOverhead * months);
  const totalProfit = totalRevenue - totalCosts;
  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">FP&A Project and Freelancer Cost Model</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded shadow">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <p className="text-sm text-gray-600">Total Costs</p>
              <p className="text-xl font-bold">${totalCosts.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-xl font-bold">${totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <p className="text-sm text-gray-600">Overall Margin</p>
              <p className="text-xl font-bold">{overallMargin}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Settings</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Monthly Overhead</label>
              <input 
                type="number"
                className="w-full p-2 border rounded"
                value={monthlyOverhead}
                onChange={(e) => setMonthlyOverhead(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Forecast Months</label>
              <input 
                type="number"
                className="w-full p-2 border rounded"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Financial Projections</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={projectionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
              <Line type="monotone" dataKey="costs" stroke="#ff7300" name="Costs" />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-medium mb-2">Add New Project</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                placeholder="Project Name"
                className="p-2 border rounded"
                name="name"
                value={newProject.name}
                onChange={handleProjectChange}
              />
              <input
                placeholder="Revenue ($)"
                type="number"
                className="p-2 border rounded"
                name="revenue"
                value={newProject.revenue}
                onChange={handleProjectChange}
              />
              <input
                placeholder="Timeline (months)"
                type="number"
                className="p-2 border rounded"
                name="timeline"
                value={newProject.timeline}
                onChange={handleProjectChange}
              />
            </div>
            <button 
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              onClick={addProject}
            >
              Add Project
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-right">Revenue</th>
                  <th className="p-3 text-right">Freelancer Cost</th>
                  <th className="p-3 text-right">Profit</th>
                  <th className="p-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {projectsWithCosts.map(project => (
                  <tr key={project.id} className="border-t">
                    <td className="p-3">{project.name}</td>
                    <td className="p-3 text-right">${project.revenue.toLocaleString()}</td>
                    <td className="p-3 text-right">${project.freelancerCost.toLocaleString()}</td>
                    <td className="p-3 text-right">${project.profit.toLocaleString()}</td>
                    <td className="p-3 text-right">{project.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Project Margins</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectsWithCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="freelancerCost" fill="#ff7300" name="Cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Freelancers</h2>
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-medium mb-2">Add New Freelancer</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                placeholder="Freelancer Name"
                className="p-2 border rounded"
                name="name"
                value={newFreelancer.name}
                onChange={handleFreelancerChange}
              />
              <input
                placeholder="Hourly Rate ($)"
                type="number"
                className="p-2 border rounded"
                name="hourlyRate"
                value={newFreelancer.hourlyRate}
                onChange={handleFreelancerChange}
              />
              <input
                placeholder="Hours Per Week"
                type="number"
                className="p-2 border rounded"
                name="hoursPerWeek"
                value={newFreelancer.hoursPerWeek}
                onChange={handleFreelancerChange}
              />
            </div>
            <button 
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
              onClick={addFreelancer}
            >
              Add Freelancer
            </button>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-right">Hourly Rate</th>
                  <th className="p-3 text-right">Hours/Week</th>
                  <th className="p-3 text-right">Weekly Cost</th>
                </tr>
              </thead>
              <tbody>
                {freelancers.map(freelancer => (
                  <tr key={freelancer.id} className="border-t">
                    <td className="p-3">{freelancer.name}</td>
                    <td className="p-3 text-right">${freelancer.hourlyRate}</td>
                    <td className="p-3 text-right">{freelancer.hoursPerWeek}</td>
                    <td className="p-3 text-right">${(freelancer.hourlyRate * freelancer.hoursPerWeek).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold mb-4">Project Assignments</h2>
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-medium mb-2">Assign Freelancer to Project</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <select 
                className="p-2 border rounded"
                name="projectId"
                value={newAssignment.projectId}
                onChange={handleAssignmentChange}
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <select
                className="p-2 border rounded"
                name="freelancerId"
                value={newAssignment.freelancerId}
                onChange={handleAssignmentChange}
              >
                <option value="">Select Freelancer</option>
                {freelancers.map(freelancer => (
                  <option key={freelancer.id} value={freelancer.id}>{freelancer.name}</option>
                ))}
              </select>
              <input
                placeholder="Weeks Assigned"
                type="number"
                className="p-2 border rounded"
                name="weeksAssigned"
                value={newAssignment.weeksAssigned}
                onChange={handleAssignmentChange}
              />
            </div>
            <button 
              className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
              onClick={addAssignment}
            >
              Assign to Project
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-left">Freelancer</th>
                  <th className="p-3 text-right">Weeks</th>
                  <th className="p-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {projectAssignments.map((assignment, idx) => {
                  const project = projects.find(p => p.id === assignment.projectId);
                  const freelancer = freelancers.find(f => f.id === assignment.freelancerId);
                  const cost = freelancer 
                    ? freelancer.hourlyRate * freelancer.hoursPerWeek * assignment.weeksAssigned 
                    : 0;
                    
                  return (
                    <tr key={idx} className="border-t">
                      <td className="p-3">{project ? project.name : 'Unknown'}</td>
                      <td className="p-3">{freelancer ? freelancer.name : 'Unknown'}</td>
                      <td className="p-3 text-right">{assignment.weeksAssigned}</td>
                      <td className="p-3 text-right">${cost.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
