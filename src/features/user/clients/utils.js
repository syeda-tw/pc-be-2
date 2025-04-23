export const generateRegistrationCode = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    return code;
};


export const sendRegistrationCode = (user, code) => {
    return `Welcome to Practicare!
  
  You've been invited by ${user.first_name} ${user.last_name} to join their network.
  
  Your registration code: ${code}
  
  Use this code to log in and complete your setup.
  
  Get started at: practicare.co/client-register`;
};

export const sendOnboardingCode = (user, code) => {
    return `Join ${user.first_name} ${user.last_name} on Practicare!
  
  You've been invited to connect on Practicare.
  
  Your onboarding code: ${code}
  
  To get started, go to your Practicare account and add your therapist using the code.`;
};