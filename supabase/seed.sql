-- Optional sample data. Run after schema.sql to see the dashboard populated.

insert into public.projects
  (title, audience, tone, length, call_to_action, status, current_step, script, caption, hashtags, scenes, checklist, publish_checklist, voice, created_at)
values
(
  '3 ways to style one linen shirt',
  'Women 25-40 who love easy, sustainable fashion',
  'Friendly', 30,
  'Shop the shirt at the link in our bio',
  'published', 7,
  '{"hook":"One shirt. Three completely different looks. Watch this.","body":"Look one: tucked into high-waist jeans with sneakers for weekend errands. Look two: knotted at the waist over a slip skirt for brunch. Look three: open over a tank with linen shorts for the beach. Same shirt, zero effort.","cta":"Shop the shirt at the link in our bio."}',
  'One linen shirt, three looks, endless summer days. Which one is your favorite? 1, 2 or 3? Tell us below!',
  array['#linenshirt','#capsulewardrobe','#outfitideas','#sustainablefashion','#smallbusiness','#styletips','#summerstyle'],
  '[{"id":"s1","description":"Hold up the folded shirt to camera","visual":"Close-up, natural light, shirt on hanger","duration":4},{"id":"s2","description":"Look 1: tucked into jeans","visual":"Full-body shot, quick spin","duration":8},{"id":"s3","description":"Look 2: knotted over a skirt","visual":"Mirror shot with a jump cut transition","duration":8},{"id":"s4","description":"Look 3: open over a tank","visual":"Outdoor shot, walking toward camera","duration":6},{"id":"s5","description":"Call to action","visual":"Text overlay on shop front","duration":4}]',
  '{"script":true,"voice":true,"visuals":true,"captions":true,"music":true}',
  '[true,true,true,true,true]',
  '{"voice_id":"ava","generated_at":"2026-09-20T10:15:00Z","duration_seconds":29}',
  now() - interval '12 days'
),
(
  'Behind the scenes: baking 200 croissants before 7am',
  'Local foodies and morning commuters',
  'Inspirational', 45,
  'Visit us this weekend and grab one fresh from the oven',
  'ready_to_publish', 7,
  '{"hook":"It''s 3am and the city is asleep. We are not.","body":"Every croissant starts the night before with 27 layers of butter and dough. At 3am we shape them by hand, proof them, and by 6:45 the first trays come out golden and crackling. Two hundred of them, every single day.","cta":"Visit us this weekend and grab one fresh from the oven."}',
  'The 3am club. 27 layers, 200 croissants, one tiny bakery that loves what it does.',
  array['#bakery','#croissant','#behindthescenes','#smallbusiness','#bakerylife','#shoplocal'],
  '[{"id":"b1","description":"Dark street, bakery lights switch on","visual":"Exterior shot, timestamp overlay 3:00am","duration":5},{"id":"b2","description":"Laminating the dough","visual":"Overhead shot of rolling pin and butter","duration":10},{"id":"b3","description":"Hand-shaping croissants","visual":"Close-up on hands, slow motion","duration":10},{"id":"b4","description":"Trays going into the oven","visual":"Side angle, oven glow","duration":8},{"id":"b5","description":"Golden croissants come out","visual":"Steam rising, satisfying crack sound","duration":7},{"id":"b6","description":"Doors open, first customer","visual":"Warm wide shot with CTA text","duration":5}]',
  '{"script":true,"voice":true,"visuals":true,"captions":true,"music":false}',
  '[false,false,false,false,false]',
  '{"voice_id":"marcus","generated_at":"2026-09-28T08:00:00Z","duration_seconds":44}',
  now() - interval '4 days'
),
(
  'Why your car battery dies in winter',
  'Car owners in cold climates',
  'Educational', 30,
  'Book a free battery check today',
  'in_progress', 4,
  '{"hook":"Your car battery isn''t dead. It''s just cold.","body":"Cold temperatures slow down the chemical reaction inside your battery, cutting its power by up to 60 percent. At the same time, your engine needs more power to start. Older batteries can''t keep up.","cta":"Book a free battery check today."}',
  'Winter is coming for your car battery. Here''s why it happens and how to stay ahead of it.',
  array['#carcare','#wintertips','#autorepair','#carbattery','#smallbusiness'],
  '[]',
  '{"script":true,"voice":false,"visuals":false,"captions":false,"music":false}',
  '[false,false,false,false,false]',
  '{"voice_id":"leo","generated_at":"2026-09-30T14:00:00Z","duration_seconds":30}',
  now() - interval '2 days'
),
(
  'New autumn candle collection launch',
  'Home decor lovers and gift shoppers',
  'Energetic', 15,
  'Pre-order now before they sell out',
  'draft', 1,
  null, '', '{}', '[]',
  '{"script":false,"voice":false,"visuals":false,"captions":false,"music":false}',
  '[false,false,false,false,false]',
  null,
  now() - interval '3 hours'
);

-- An own-video Reel ("Post a video I already have"), resumed at the Cover step.
insert into public.projects
  (title, audience, tone, length, call_to_action, status, current_step, script, caption, hashtags, scenes, checklist, publish_checklist, voice, source, video, created_at)
values
(
  'Customer seeing her new haircut for the first time',
  'Women in our neighborhood looking for a new stylist',
  'Friendly', 21,
  'Book your appointment at the link in our bio',
  'in_progress', 3,
  null,
  'We just had to share this: customer seeing her new haircut for the first time 💛

Made for women in our neighborhood looking for a new stylist.

Book your appointment at the link in our bio.

Tell us what you think in the comments 💬',
  array['#customerseeingnewhaircut','#customer','#seeing','#haircut','#communitylove','#reels','#smallbusiness','#shoplocal'],
  '[]',
  '{"script":false,"voice":false,"visuals":false,"captions":false,"music":false}',
  '[false,false,false,false,false]',
  null,
  'existing',
  jsonb_build_object(
    'file_name', 'haircut-reveal.mov',
    'mime_type', 'video/quicktime',
    'size_bytes', 48211234,
    'duration_seconds', 21.4,
    'width', 1080,
    'height', 1920,
    'playable', true,
    'cover_image', 'data:image/jpeg;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z',
    'cover_text', 'Wait for her reaction',
    'cover_time_seconds', 7.2
  ),
  now() - interval '5 hours'
);
