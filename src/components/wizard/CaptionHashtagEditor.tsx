import { useState } from 'react';
import { Hash, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { normalizeHashtags } from '@/lib/utils';
import type { Project, ProjectInput } from '@/types/project';

/** Instagram caption + hashtag chips. Shared by the Script step and the own-video Caption step. */
export function CaptionHashtagEditor({
  project,
  update,
}: {
  project: Pick<Project, 'caption' | 'hashtags'>;
  update: (patch: ProjectInput) => void;
}) {
  const [tagDraft, setTagDraft] = useState('');

  const addTags = () => {
    const added = normalizeHashtags(tagDraft);
    if (added.length) update({ hashtags: Array.from(new Set([...project.hashtags, ...added])) });
    setTagDraft('');
  };

  const removeTag = (tag: string) => update({ hashtags: project.hashtags.filter((t) => t !== tag) });

  return (
    <div className="grid gap-5">
      <Field label="Instagram Caption" trailing={`${project.caption.length}/2200`}>
        {(id) => (
          <Textarea
            id={id}
            rows={5}
            maxLength={2200}
            value={project.caption}
            onChange={(e) => update({ caption: e.target.value })}
          />
        )}
      </Field>

      <Field label="Hashtags" hint="3 to 10 relevant hashtags works best. Press Enter to add." trailing={`${project.hashtags.length} tags`}>
        {(id) => (
          <div>
            <div className="flex gap-2">
              <Input
                id={id}
                value={tagDraft}
                placeholder="#yourcity #yourniche"
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTags();
                  }
                }}
                onBlur={addTags}
              />
              <Button variant="secondary" onClick={addTags} icon={<Hash className="h-4 w-4" />}>
                Add
              </Button>
            </div>
            {project.hashtags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.hashtags.map((tag) => (
                  <li
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="rounded-full p-0.5 hover:bg-brand-100 dark:hover:bg-brand-500/20"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Field>
    </div>
  );
}
