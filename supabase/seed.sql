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
