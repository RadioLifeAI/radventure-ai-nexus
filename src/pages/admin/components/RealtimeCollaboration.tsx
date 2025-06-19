
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useRealtime } from '@/lib/realtime/RealtimeProvider';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  MessageCircle, 
  Eye, 
  Edit3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  X
} from 'lucide-react';

interface CollaborationProps {
  eventId: string;
  onCollaborativeEdit?: (changes: any) => void;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'viewing' | 'editing' | 'commenting';
  lastSeen: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  x?: number;
  y?: number;
}

export function RealtimeCollaboration({ eventId, onCollaborativeEdit }: CollaborationProps) {
  const { joinRoom, leaveRoom, sendMessage, onMessage, getPresence } = useRealtime();
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    if (user && eventId) {
      const userInfo = {
        id: user.id,
        name: user.full_name || user.email || 'Usuário',
        avatar: user.avatar_url,
        status: 'viewing',
        lastSeen: new Date().toISOString()
      };

      joinRoom(`event_${eventId}`, userInfo);

      // Listen to presence updates
      const interval = setInterval(() => {
        const presence = getPresence(`event_${eventId}`);
        setActiveUsers(presence.map((p: any) => p));
      }, 1000);

      // Listen to messages
      onMessage(`event_${eventId}`, (payload) => {
        const { type, data } = payload.payload;
        
        switch (type) {
          case 'comment':
            setComments(prev => [...prev, data]);
            break;
          case 'edit':
            if (onCollaborativeEdit) {
              onCollaborativeEdit(data);
            }
            break;
          case 'cursor':
            // Handle cursor movements
            break;
        }
      });

      return () => {
        clearInterval(interval);
        leaveRoom(`event_${eventId}`);
      };
    }
  }, [user, eventId]);

  const addComment = () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.full_name || user.email || 'Usuário',
      content: newComment,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    sendMessage(`event_${eventId}`, {
      type: 'comment',
      data: comment
    });

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(c => 
        c.id === commentId ? { ...c, resolved: true } : c
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'editing':
        return <Edit3 className="h-3 w-3 text-blue-600" />;
      case 'commenting':
        return <MessageCircle className="h-3 w-3 text-green-600" />;
      default:
        return <Eye className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'editing':
        return 'border-blue-500';
      case 'commenting':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Colaboradores Ativos ({activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <div className={`relative ${getStatusColor(user.status)} border-2 rounded-full p-0.5`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusIcon(user.status)}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              Comentários ({comments.filter(c => !c.resolved).length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                {showComments ? 'Ocultar' : 'Mostrar'}
              </Button>
              <Button 
                variant={isCommentMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCommentMode(!isCommentMode)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Comentar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showComments && (
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px]"
              />
              <Button onClick={addComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments
                .filter(c => !c.resolved)
                .map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {comment.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(comment.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveComment(comment.id)}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                ))}
              
              {comments.filter(c => !c.resolved).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum comentário ativo</p>
                </div>
              )}
            </div>

            {/* Resolved Comments */}
            {comments.filter(c => c.resolved).length > 0 && (
              <details className="mt-4">
                <summary className="text-sm text-gray-600 cursor-pointer">
                  Comentários resolvidos ({comments.filter(c => c.resolved).length})
                </summary>
                <div className="mt-2 space-y-2">
                  {comments
                    .filter(c => c.resolved)
                    .map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-2 bg-green-50 rounded opacity-60">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{comment.userName}: </span>
                          <span className="text-sm">{comment.content}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </CardContent>
        )}
      </Card>

      {/* Collaboration Status */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Colaboração em tempo real ativa</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>Auto-salvamento: ativo</span>
              <span>Sincronização: OK</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
