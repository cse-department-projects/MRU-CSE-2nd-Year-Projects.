export const fetchTopDoctors = async (): Promise<any[]> => {
  return [
    { 
      id: 'doc-1', 
      full_name: 'Dr. Sarah Jenkins', 
      specialty: 'Cardiology', 
      rating: 4.9, 
      reviews: 128, 
      distance: '2.5 mi', 
      nextAvailable: 'Today, 2:00 PM',
      image: '/src/assets/doctor_3d.png',
      hospital: 'San Francisco General Hospital',
      address: '1001 Potrero Ave, San Francisco, CA 94110',
      phone: '(415) 206-8000',
      acceptsNewPatients: true,
      experience: '15 Years',
      fee: '$150',
      languages: ['English', 'Spanish']
    }
  ];
};

export const getBodyPartData = async (part: string): Promise<any> => {
  return {
    id: part,
    name: part,
    system: 'General',
    description: 'A mock part',
    commonConditions: [],
    aiRecommendations: [],
    relatedSpecialty: 'General Practice'
  };
};
