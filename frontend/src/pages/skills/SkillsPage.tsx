import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Award, TrendingUp, Users, Target, Plus, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function SkillsPage() {
  const { user } = useAuthStore();
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  
  // Mock data (backend integration pending)
  const employeeSkills = [
    { id: '1', skill: { skillName: 'React', category: 'Frontend' }, proficiencyLevel: 'EXPERT', yearsOfExperience: 5, endorsementCount: 12, verified: true, willingToMentor: true },
    { id: '2', skill: { skillName: 'TypeScript', category: 'Programming' }, proficiencyLevel: 'ADVANCED', yearsOfExperience: 4, endorsementCount: 8, verified: true, willingToMentor: false },
    { id: '3', skill: { skillName: 'Node.js', category: 'Backend' }, proficiencyLevel: 'ADVANCED', yearsOfExperience: 3, endorsementCount: 6, verified: false, willingToMentor: true },
  ];
  
  const opportunities = [
    { id: '1', title: 'Frontend Lead - New Project', description: 'Lead frontend development for our new customer portal', opportunityType: 'Project', durationWeeks: 12, department: 'Engineering' },
    { id: '2', title: 'Mentorship Program', description: 'Mentor junior developers in React and TypeScript', opportunityType: 'Mentorship', durationWeeks: 8, department: 'Engineering' },
  ];
  
  const skillGaps = [
    { skill: 'Python', gap: 3, employeeCount: 2 },
    { skill: 'DevOps', gap: 2, employeeCount: 3 },
  ];
  
  const handleAddSkill = () => {
    toast.success('Skill added successfully!');
    setShowAddSkillModal(false);
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'EXPERT': return 'bg-purple-100 text-purple-800';
      case 'ADVANCED': return 'bg-blue-100 text-blue-800';
      case 'INTERMEDIATE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-blue-600" />
            Skills & Talent Marketplace
          </h1>
          <p className="text-gray-600 mt-1">Manage your skills and find opportunities</p>
        </div>
        <Button onClick={() => setShowAddSkillModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Skills</p>
                <p className="text-2xl font-bold">{employeeSkills.length}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Opportunities</p>
                <p className="text-2xl font-bold">{opportunities.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skill Gaps</p>
                <p className="text-2xl font-bold text-orange-600">{skillGaps.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Endorsements</p>
                <p className="text-2xl font-bold">
                  {employeeSkills.reduce((sum, s) => sum + s.endorsementCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Skills */}
        <Card>
          <CardHeader>
            <CardTitle>My Skills Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeeSkills.map((skill) => (
                <div key={skill.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{skill.skill.skillName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {skill.skill.category} • {skill.yearsOfExperience} years
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getProficiencyColor(skill.proficiencyLevel)}`}>
                      {skill.proficiencyLevel}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {skill.endorsementCount} endorsements
                    </span>
                    {skill.verified && (
                      <span className="text-green-600 flex items-center gap-1">
                        ✓ Verified
                      </span>
                    )}
                    {skill.willingToMentor && (
                      <span className="text-blue-600">Willing to mentor</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Internal Marketplace */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-semibold">{opp.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="text-gray-600">{opp.opportunityType}</span>
                    {opp.durationWeeks && (
                      <span className="text-gray-600">{opp.durationWeeks} weeks</span>
                    )}
                    <span className="text-blue-600">{opp.department}</span>
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => toast.success('Application submitted!')}>
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gaps */}
      {skillGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organizational Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {skillGaps.map((gap, idx) => (
                <div key={idx} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h3 className="font-semibold text-orange-900">{gap.skill}</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Need {gap.gap} more employees with this skill
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    Currently: {gap.employeeCount} employees
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Skill</h2>
              <button onClick={() => setShowAddSkillModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g., Python, Project Management" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proficiency Level</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>BEGINNER</option>
                  <option>INTERMEDIATE</option>
                  <option>ADVANCED</option>
                  <option>EXPERT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                <input type="number" className="w-full border rounded px-3 py-2" placeholder="0" min="0" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddSkillModal(false)}>Cancel</Button>
                <Button onClick={handleAddSkill}>Add Skill</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
