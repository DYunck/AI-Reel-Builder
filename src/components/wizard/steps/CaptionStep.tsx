import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { CaptionHashtagEditor } from '@/components/wizard/CaptionHashtagEditor';
import { StepFooter, StepIntro } from '@/components/wizard/StepFooter';
import type { StepProps } from '@/components/wizard/types';
import { generateVideoCaption } from '@/lib/contentGenerator';

export function CaptionStep({ project, update, goNext, goBack }: StepProps) {
  const confirm = useConfirm();
  const [generating, setGenerating] = useState(false);

  const regenerate = async () => {
    const ok = await confirm({
      title: 'Write a new caption?',
      message: 'This replaces your current caption and hashtags, including any edits you made.',
      confirmLabel: 'Write a new one',
    });
    if (!ok) return;
    setGenerating(true);
    try {
      update(
        await generateVideoCaption({
          description: project.title,
          audience: project.audience,
          tone: project.tone,
          call_to_action: project.call_to_action,
          duration_seconds: project.video?.duration_seconds ?? project.length,
        }),
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <StepIntro
          title="Your caption"
          description="We wrote this from your description. Change anything you like, it saves automatically."
        />
        <Button
          variant="secondary"
          size="sm"
          className="mb-6 self-start"
          onClick={regenerate}
          loading={generating}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Write a new one
        </Button>
      </div>

      <CaptionHashtagEditor project={project} update={update} />

      <StepFooter onBack={goBack}>
        <Button size="lg" onClick={goNext} disabled={!project.caption.trim()} iconRight={<ArrowRight className="h-4 w-4" />}>
          Continue to Cover
        </Button>
      </StepFooter>
    </div>
  );
}
