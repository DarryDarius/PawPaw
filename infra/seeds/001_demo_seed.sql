truncate table
  recommendation_logs,
  blocks,
  reports,
  feedback,
  playdate_participants,
  playdates,
  messages,
  conversations,
  matches,
  swipes,
  pet_profiles,
  pets,
  owner_profiles,
  users,
  locations
restart identity cascade;

insert into users (id, email_hash, phone_hash, nickname, avatar_url, neighborhood, privacy_level, risk_state)
select
  gs,
  'seed-email-' || gs,
  'seed-phone-' || gs,
  'Owner ' || gs,
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
  (array['Hyde Park', 'Kenwood', 'South Loop', 'Woodlawn'])[1 + (gs % 4)],
  'neighborhood',
  'normal'
from generate_series(1, 60) as gs;

insert into owner_profiles (user_id, available_windows, meetup_preferences, max_distance_km, safety_preferences)
select
  id,
  case
    when id % 3 = 0 then '["weekday_evening", "weekend_afternoon"]'::jsonb
    when id % 3 = 1 then '["weekend_morning", "weekend_afternoon"]'::jsonb
    else '["weekday_evening", "weekend_morning"]'::jsonb
  end,
  '["public_place_only", "small_group_ok"]'::jsonb,
  case when id % 5 = 0 then 3 else 5 end,
  '["vaccine_preferred", "no_home_address"]'::jsonb
from users;

insert into pets (id, owner_user_id, name, species, breed, birth_date, sex, avatar_url)
select
  id,
  id,
  (array['Mochi', 'Biscuit', 'Luna', 'Otis', 'Pepper', 'Nori', 'Maple', 'Scout', 'Waffles', 'Poppy'])[1 + (id % 10)] || ' ' || id,
  'dog',
  (array['Corgi', 'Beagle', 'Toy Poodle', 'Golden Retriever', 'Shiba Inu', 'Australian Shepherd', 'French Bulldog', 'Mixed Breed'])[1 + (id % 8)],
  date '2019-01-01' + ((id::integer) * 41),
  (array['female', 'male', 'unknown'])[1 + (id % 3)],
  (array[
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80'
  ])[1 + (id % 4)]
from users;

insert into pet_profiles (
  pet_id,
  size,
  neutered,
  vaccine_status,
  personality_tags,
  activity_preferences,
  accepts_large_dogs,
  energy_level,
  neighborhood
)
select
  pets.id,
  (array['small', 'medium', 'large'])[1 + (pets.id % 3)],
  pets.id % 4 <> 0,
  case when pets.id % 7 = 0 then 'unknown' when pets.id % 5 = 0 then 'self_reported' else 'verified' end,
  case
    when pets.id % 4 = 0 then '["playful", "high_energy", "large_dog_friendly"]'::jsonb
    when pets.id % 4 = 1 then '["friendly", "gentle", "shy_at_first"]'::jsonb
    when pets.id % 4 = 2 then '["calm", "people_friendly", "selective"]'::jsonb
    else '["curious", "food_motivated", "friendly"]'::jsonb
  end,
  case
    when pets.id % 3 = 0 then '["dog_park", "fetch", "short_trip"]'::jsonb
    when pets.id % 3 = 1 then '["walk", "cafe", "small_group"]'::jsonb
    else '["walk", "dog_park", "training"]'::jsonb
  end,
  pets.id % 2 = 0,
  (array['low', 'medium', 'high'])[1 + (pets.id % 3)],
  users.neighborhood
from pets
join users on users.id = pets.owner_user_id;

insert into locations (id, name, type, city, neighborhood, geohash, is_public_place, safety_notes)
values
  (1, 'Jackson Bark', 'Dog park', 'Chicago', 'Hyde Park', 'dp3wjzn', true, 'Fenced dog park, best for daytime meetups.'),
  (2, 'Promontory Point', 'Lakefront walk', 'Chicago', 'Hyde Park', 'dp3wjyp', true, 'Open public route, keep dogs leashed.'),
  (3, 'Harold Washington Park', 'Park', 'Chicago', 'Hyde Park', 'dp3wjzm', true, 'Good public green space for first meetups.'),
  (4, 'Nichols Park', 'Park', 'Chicago', 'Hyde Park', 'dp3wjyv', true, 'Busy neighborhood park with open sight lines.'),
  (5, 'Washington Park', 'Park', 'Chicago', 'Washington Park', 'dp3wjxv', true, 'Large public park; recommend daytime areas.'),
  (6, 'Burnham Park Trail', 'Lakefront walk', 'Chicago', 'Kenwood', 'dp3wmn0', true, 'Leashed walking route with lakefront visibility.'),
  (7, 'Ellis Park', 'Park', 'Chicago', 'Bronzeville', 'dp3wmj1', true, 'Public park suitable for calm introductions.'),
  (8, 'Grant Bark Park', 'Dog park', 'Chicago', 'South Loop', 'dp3wmr4', true, 'Fenced dog-friendly area in a busy public setting.'),
  (9, 'Fred Anderson Dog Park', 'Dog park', 'Chicago', 'South Loop', 'dp3wmq8', true, 'Popular fenced dog park with separate small dog area.'),
  (10, 'Ping Tom Memorial Park', 'Park', 'Chicago', 'Chinatown', 'dp3wmn8', true, 'Public park and river walk; keep dogs leashed.'),
  (11, 'Hyde Park Pet Friendly Cafe', 'Cafe patio', 'Chicago', 'Hyde Park', 'dp3wjzq', true, 'Best for calm dogs and short first meetups.'),
  (12, 'Wooded Island', 'Park', 'Chicago', 'Hyde Park', 'dp3wjyk', true, 'Quiet public walking area; leash required.'),
  (13, 'Midway Plaisance', 'Park', 'Chicago', 'Hyde Park', 'dp3wjxq', true, 'Open public route for short walks.'),
  (14, '31st Street Beach Walk', 'Lakefront walk', 'Chicago', 'Bronzeville', 'dp3wmk7', true, 'Public lakefront path with high visibility.'),
  (15, 'Maggie Daley Park', 'Park', 'Chicago', 'Loop', 'dp3wmx2', true, 'Busy central public park; better for confident dogs.');

select setval(pg_get_serial_sequence('users', 'id'), (select max(id) from users));
select setval(pg_get_serial_sequence('pets', 'id'), (select max(id) from pets));
select setval(pg_get_serial_sequence('locations', 'id'), (select max(id) from locations));
