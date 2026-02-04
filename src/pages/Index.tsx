const Index = () => {
  // Redirect to landing page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
  return null;
};

export default Index;
