const devotionals = [
    {
      date: '2023-11-01',
      verse: 'Psalm 147:7',
      passage: 'Sing unto the Lord with thanksgiving; sing praise upon the harp unto our God.',
      topic: 'Praise in All Circumstances',
      content: 'God deserves our praise in every season of life   Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rerum eius, aliquid cupiditate repellat magni repellendus necessitatibus error pariatur voluptatum quae, aspernatur distinctio esse obcaecati voluptas alias sit, iusto adipisci? Nisi!...',
      meditation: 'Consider how you can incorporate praise into your daily routine...',
      prayer: 'Lord, teach me to praise You in all circumstances...'
    },
    {
      date: '2023-11-02',
      verse: 'Philippians 4:6',
      passage: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.',
      topic: 'Peace Through Prayer',
      content: 'God invites us to bring all our concerns to Him   Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rerum eius, aliquid cupiditate repellat magni repellendus necessitatibus error pariatur voluptatum quae, aspernatur distinctio esse obcaecati voluptas alias sit, iusto adipisci? Nisi!... ',
      meditation: 'Reflect on areas where you need to surrender anxiety...',
      prayer: 'Heavenly Father, I bring my worries to You today...'
    }
    // Add more devotionals for each day
  ];
  
  export function getTodaysDevotional() {
    const today = new Date().toISOString().split('T')[0];
    const defaultDevotional = devotionals[0];
    
    // Find devotional for today or return default
    return devotionals.find(d => d.date === today) || defaultDevotional;
  }