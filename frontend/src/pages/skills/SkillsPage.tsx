import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Award, TrendingUp, Users, Target, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

export default function SkillsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data: employeeSkills } = useQuery({
    queryKey: ['employee-skills', user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/skills-cloud/employee-skills/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const { data: opportunities } = useQuery({
    queryKey: ['opportunities', user?.organizationId],
    queryFn: async () => {
      const response = await axios.get(`/api/skills-cloud/opportunities/${user?.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId,
  });

  const { data: skillGaps } = useQuery({
    queryKey: ['skill-gaps', user?.organizationId],
    queryFn: async () => {
      const response = await axios.get(`/api/skills-cloud/skill-gaps/${user?.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId,
  });

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
        <Button>
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
                <p className="text-2xl font-bold">{employeeSkills?.length || 0}</p>
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
                <p className="text-2xl font-bold">{opportunities?.length || 0}</p>
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
                <p className="text-2xl font-bold text-orange-600">{skillGaps?.length || 0}</p>
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
                  {employeeSkills?.reduce((sum: number, s: any) => sum + s.endorsementCount, 0) || 0}
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
            {!employeeSkills || employeeSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No skills added yet. Add your first skill!
              </div>
            ) : (
              <div className="space-y-3">
                {employeeSkills.map((skill: any) => (
                  <div key={skill.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{skill.skill?.skillName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {skill.skill?.category} • {skill.yearsOfExperience || 0} years
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
            )}
          </CardContent>
        </Card>

        {/* Internal Marketplace */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            {!opportunities || opportunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No opportunities available right now
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.slice(0, 5).map((opp: any) => (
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
                    <Button size="sm" className="mt-3">
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill Gaps */}
      {skillGaps && skillGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organizational Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {skillGaps.map((gap: any, idx: number) => (
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
    </div>
  );
}
