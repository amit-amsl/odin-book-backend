const extractYouTubeIdFromURL = (youtubeURL: string) => {
  const url = new URL(youtubeURL);
  const isValidYoutubeURL =
    url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
  if (isValidYoutubeURL) {
    return url.hostname === 'youtu.be'
      ? url.pathname.slice(1) // Get the video's id without the slash
      : url.searchParams.get('v'); // Get the video's id from the search param "v"
  }
  return null;
};

export { extractYouTubeIdFromURL };
