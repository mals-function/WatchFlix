async function inspect() {
  try {
    const res = await fetch('https://streamflix.mindorostate-u.com/');
    const html = await res.text();
    console.log('HTML snippet:', html.substring(0, 1000));
    const scriptMatches = html.match(/src="([^"]+)"/g);
    console.log('Script tags:', scriptMatches);
  } catch (e) {
    console.error('Error fetching streamflix:', e.message);
  }
}
inspect();
