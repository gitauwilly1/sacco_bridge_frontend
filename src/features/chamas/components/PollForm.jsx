import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';

export default function PollForm() {
  const { chamaId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => chamaApi.createPoll(chamaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-polls', chamaId] });
      toast.success('Poll created successfully');
      navigate({ to: `/chamas/${chamaId}/polls` });
    },
    onError: (error) => {
      const msg = error.response?.data?.error?.message || 'Failed to create poll';
      toast.error(msg);
    },
  });

  const addOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const validate = () => {
    const e = {};
    if (!question.trim()) e.question = 'Question is required';
    const filledOptions = options.filter((o) => o.trim());
    if (filledOptions.length < 2) e.options = 'At least 2 options are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      question: question.trim(),
      options: options.filter((o) => o.trim()),
      is_anonymous: isAnonymous,
    });
  };

  return (
    <div className="pb-4">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/chamas/${chamaId}/polls` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold font-heading text-slate">New Poll</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
            <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
              <Vote className="h-4 w-4 text-terracotta" />
              Create a Poll
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="question" className="text-xs font-bold text-slate">Question</Label>
                <Input id="question" value={question} onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What day works best for the next meeting?"
                  className={`border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 ${errors.question ? 'border-danger' : ''}`} />
                {errors.question && <p className="text-[10px] text-danger font-medium">{errors.question}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate">Options</Label>
                {options.map((option, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={option} onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 flex-1" />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/5 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {errors.options && <p className="text-[10px] text-danger font-medium">{errors.options}</p>}
                {options.length < 10 && (
                  <button type="button" onClick={addOption}
                    className="flex items-center gap-1.5 text-xs text-terracotta font-bold hover:text-clay transition-colors mt-1">
                    <Plus className="h-3.5 w-3.5" /> Add Option
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="anonymous" className="text-xs font-bold text-slate">Anonymous Voting</Label>
                  <p className="text-[10px] text-gray-400">Voters&apos; identities won&apos;t be shown</p>
                </div>
                <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              </div>

              <Button type="submit" disabled={createMutation.isPending}
                className="w-full bg-terracotta hover:bg-clay text-white shadow-sm transition-all">
                {createMutation.isPending ? 'Creating...' : 'Create Poll'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
