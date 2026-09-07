export default function BrowserIcons() {
  const browsers = [
    { name: 'Chrome', src: '@/images/crome.jpg' },
    { name: 'Firefox', src: '@/images/firefox.jpg' },
    { name: 'Opera', src: '@/images/opera.jpg' }
  ];

  return (
    <div className="text-center mt-3">
      <table cellPadding="30%" cellSpacing="10%" align="center">
        <tbody>
          <tr>
            {browsers.map((browser) => (
              <td key={browser.name}>
                <img
                  src={browser.src}
                  width="40"
                  height="40"
                  title={browser.name}
                  className="img-fluid"
                  alt={browser.name}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}