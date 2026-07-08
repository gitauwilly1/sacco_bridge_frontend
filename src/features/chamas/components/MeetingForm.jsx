import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';

export default function MeetingForm() {
  const { chamaId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [virtualLink, setVirtualLink] = useState('');
  const [agenda, setAgenda] = useState('');
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => chamaApi.createMeeting(chamaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-meetings', chamaId] });
      toast.success('Meeting created successfully');
      navigate({ to: `/chamas/${chamaId}/meetings` });
    },
    onError: (error) => {
      const msg = error.response?.data?.error?.message || 'Failed to create meeting';
      toast.error(msg);
    },
  });

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!date) e.date = 'Date is required';
    if (!time) e.time = 'Time is required';
    if (!location.trim() && !virtualLink.trim()) e.location = 'Location or virtual link is required';
    if (virtualLink && !/^https?:\/\//.test(virtualLink)) e.virtualLink = 'Must be a valid URL (https://...)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      title: title.trim(),
      date,
      time,
      location: location.trim() || null,
      virtual_link: virtualLink.trim() || null,
      agenda: agenda.trim() || null,
    });
  };

  return (
    <div className="pb-4">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/chamas/${chamaId}/meetings` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold font-heading text-slate">New Meeting</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
            <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
              <Calendar className="h-4 w-4 text-terracotta" />
              Schedule Meeting
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold text-slate">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Weekly check-in"
                  className={`border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 ${errors.title ? 'border-danger' : ''}`} />
                {errors.title && <p className="text-[10px] text-danger font-medium">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-bold text-slate">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className={`border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 ${errors.date ? 'border-danger' : ''}`} />
                  {errors.date && <p className="text-[10px] text-danger font-medium">{errors.date}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time" className="text-xs font-bold text-slate">Time</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className={`border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 ${errors.time ? 'border-danger' : ''}`} />
                  {errors.time && <p className="text-[10px] text-danger font-medium">{errors.time}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-bold text-slate">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Conference Room A"
                  className={`border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 ${errors.location ? 'border-danger' : ''}`} />
                {errors.location && <p className="text-[10px] text-danger font-medium">{errors.location}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="virtualLink" className="text-xs font-bold text-slate">Virtual Meeting Link</Label>
                <Input id="virtualLink" value={virtualLink} onChange={(e) => setVirtualLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className={`border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 ${errors.virtualLink ? 'border-danger' : ''}`} />
                {errors.virtualLink && <p className="text-[10px] text-danger font-medium">{errors.virtualLink}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="agenda" className="text-xs font-bold text-slate">Agenda</Label>
                <Textarea id="agenda" value={agenda} onChange={(e) => setAgenda(e.target.value)}
                  placeholder="1. Review contributions&#10;2. Pending loans&#10;3. Upcoming events"
                  className="border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 min-h-[100px]" />
              </div>

              <Button type="submit" disabled={createMutation.isPending}
                className="w-full bg-terracotta hover:bg-clay text-white shadow-sm transition-all">
                {createMutation.isPending ? 'Creating...' : 'Create Meeting'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
