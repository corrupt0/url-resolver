const { gql } = require('../../../tests/util');
const { closeBrowser } = require('../../lib/scrap');

describe('resolveUrls', () => {
  it('resolves normal URLs', async () => {
    const result = await gql`
      {
        resolvedUrls(urls: ["https://example.com"]) {
          url
          canonical
          title
          summary
          html
          topImageUrl
          status
          error
        }
      }
    `();

    expect(result).toMatchSnapshot();
  });

  it('returns fetch error properly', async () => {
    const result = await gql`
      {
        resolvedUrls(
          urls: [
            "https://this-cannot-be-resolved.com"
            "line://ch/1341209850"
            "https://identityredesign.tw/vote-list.html" # has domain, but don't respond
            "https://www.ey.gov.tw/File/66E9E54960EB958B?A=C" # PDF file, which is not supported
            "https://ds.easyline.com.tw/media/camera_images/2019/01/05/f/d/fdc49a36-10b2-11e9-adee-b06ebf3a9f15.jpg" # Images, not supported
            "https://organizejobs.net/en/support.php" # Cert error
            "https://99md.cn/fslh" # Refuses bot connection (connect ECONNREFUSED)
          ]
        ) {
          url
          error
        }
      }
    `();

    expect(result).toMatchSnapshot();
  });

  it.skip('resolves alert boxes', async () => {});

  it.skip('resolves 301 redirects', async () => {});

  it('resolves Javascript / html redirects', async () => {
    const result = await gql`
      {
        resolvedUrls(
          urls: [
            "https://www.tstartel.com/static/discount/20161020_rollover/index.htm?utm_source=line&utm_medium=pic&utm_content=line_0504.rollover" # uses window.location.href
            "https://ikeabc.ecrm.com.tw/ikeaoa/l/11166" # uses window.location.replace()
            "https://www.gvm.com.tw/article_content_33230.html" # uses <meta /> refresh
          ]
        ) {
          url
          canonical
          title
        }
      }
    `();

    expect(result).toMatchSnapshot();
  });

  it('handles youtube URL', async () => {
    const result = await gql`
      {
        resolvedUrls(
          urls: [
            "https://www.youtube.com/watch?v=jNQXAC9IVRw"
            "https://www.youtube.com/watch?v=not-exist"
          ]
        ) {
          url
          canonical
          title
          summary
          status
          error
        }
      }
    `();

    expect(result).toMatchSnapshot();
  });

  it('returns minimal data on error', async () => {
    const result = await gql`
      {
        resolvedUrls(
          urls: [
            "http://blog.udn.com/watercmd/1066441" # https://github.com/cofacts/url-resolver/issues/2
            "https://pension.president.gov.tw/cp.aspx?n=0710ED8C9356A871" # This page overrides URL and causes error when fetching topImageUrl - https://github.com/cofacts/url-resolver/issues/4
            "http://ms7.tw/DL/D?k=app_daily_coupon" # This page don't have error, but executor() returns nothing
            "http://blog.renren.com/share/300233063/14628038408" # https://github.com/cofacts/url-resolver/issues/4
          ]
        ) {
          url
          canonical
          title
          summary
          topImageUrl
          error
        }
      }
    `();

    expect(result).toMatchSnapshot();
  });

  it('handles URLs without protocol', async () => {
    const result = await gql`
      {
        resolvedUrls(urls: ["example.com"]) {
          url
          canonical
          title
        }
      }
    `();

    // Note that url should be same as input.
    //
    expect(result).toMatchSnapshot();
  });
});

afterAll(async () => {
  await closeBrowser();

  // eslint-disable-next-line no-console
  console.log('browser closed.');
});
