import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { recruitmentService, Application } from '../../services/recruitment.service';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Star,
  Flag,
  Tag,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';

const STAGES = [
  { key: 'NEW', label: 'New', color: 'bg-gray-100' },
  { key: 'SCREENING', label: 'Screening', color: 'bg-blue-100' },
  { key: 'HM_SCREEN', label: 'HM Screen', color: 'bg-purple-100' },
  { key: 'ASSESSMENT', label: 'Assessment', color: 'bg-yellow-100' },
  { key: 'INTERVIEW', label: 'Interview', color: 'bg-green-100' },
  { key: 'PANEL', label: 'Panel', color: 'bg-indigo-100' },
  { key: 'REFERENCE_CHECK', label: 'Reference', color: 'bg-pink-100' },
  { key: 'OFFER', label: 'Offer', color: 'bg-orange-100' },
  { key: 'HIRED', label: 'Hired', color: 'bg-green-200' },
];

export function PipelinePage() {
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Record<string, Application[]>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (requisitionId) {
      loadPipeline();
      loadStats();
    }
  }, [requisitionId]);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      const data = await recruitmentService.getPipeline(requisitionId!);
      setPipeline(data);
    } catch (error) {
      console.error('Failed to load pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await recruitmentService.getApplicationStats(requisitionId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    // Optimistically update UI
    const newPipeline = { ...pipeline };
    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    
    const [movedApp] = newPipeline[sourceStage].splice(source.index, 1);
    newPipeline[destStage].splice(destination.index, 0, movedApp);
    setPipeline(newPipeline);

    // Call API
    try {
      await recruitmentService.moveApplicationStage(draggableId, destStage);
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to move application:', error);
      // Revert on error
      loadPipeline();
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return;

    try {
      await recruitmentService.rejectApplication(applicationId, 'Not a fit');
      loadPipeline();
      loadStats();
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    
    const variant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Star className="h-3 w-3" />
        {score}
      </Badge>
    );
  };

  const getFlagIcon = (flags: any[]) => {
    if (!flags || flags.length === 0) return null;
    
    const hasRed = flags.some(f => f.type === 'RED');
    const hasAmber = flags.some(f => f.type === 'AMBER');
    
    if (hasRed) {
      return <Flag className="h-4 w-4 text-red-500 fill-red-500" />;
    }
    if (hasAmber) {
      return <Flag className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
    }
    return <Flag className="h-4 w-4 text-green-500 fill-green-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/recruitment/requisitions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Pipeline</h1>
            <p className="text-gray-600 mt-1">Drag and drop to move candidates through stages</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Hired</p>
              <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(stats.avgScore)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Red Flags</p>
              <p className="text-2xl font-bold text-red-600">{stats.withRedFlags}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const applications = pipeline[stage.key] || [];
            
            return (
              <div key={stage.key} className="flex-shrink-0 w-80">
                <Card className={`${stage.color} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        {stage.label}
                      </CardTitle>
                      <Badge variant="default">{applications.length}</Badge>
                    </div>
                  </CardHeader>

                  <Droppable droppableId={stage.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[500px] px-4 pb-4 space-y-3 ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {applications.map((app, index) => (
                          <Draggable
                            key={app.id}
                            draggableId={app.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                                onClick={() => setSelectedApplication(app)}
                              >
                                <div className="space-y-2">
                                  {/* Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900">
                                        {app.candidate?.firstName} {app.candidate?.lastName}
                                      </h4>
                                      <p className="text-xs text-gray-500">
                                        Applied {new Date(app.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {getFlagIcon(app.flags)}
                                  </div>

                                  {/* Contact */}
                                  <div className="space-y-1 text-xs text-gray-600">
                                    {app.candidate?.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">{app.candidate.email}</span>
                                      </div>
                                    )}
                                    {app.candidate?.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{app.candidate.phone}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Score */}
                                  {app.scoreTotal && (
                                    <div className="flex items-center justify-between">
                                      {getScoreBadge(app.scoreTotal)}
                                    </div>
                                  )}

                                  {/* Tags */}
                                  {app.tags && app.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {app.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="default" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {app.tags.length > 2 && (
                                        <Badge variant="default" className="text-xs">
                                          +{app.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/recruitment/applications/${app.id}`);
                                      }}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs text-red-600 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(app.id);
                                      }}
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {applications.length === 0 && (
                          <div className="text-center text-gray-400 text-sm py-8">
                            No candidates in this stage
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
