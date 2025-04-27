

export const sendOnboardingCode = (user, code) => {
    return `Join ${user.first_name} ${user.last_name} on Practicare!
  
  You've been invited to connect on Practicare.
  
  Your onboarding code: ${code}
  
  To get started, go to your Practicare account and add your therapist using the code.`;
};