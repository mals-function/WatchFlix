package com.watchflix.app;

import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.view.Display;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class MainActivity extends BridgeActivity {

    // Known ad networks, redirectors, trackers, and popup domains (uBlock / Brave Shields list)
    private static final String[] AD_KEYWORDS = new String[] {
        "adsterra", "popads", "propellerads", "exoclick", "trafficjunky", "histats",
        "onclickads", "onclick", "doubleclick", "googlesyndication", "adnxs",
        "admaven", "monetag", "hilltopads", "richpush", "bet365", "1xbet", "melbet",
        "mostbet", "parimatch", "vulkan", "casino", "gambling", "syndication",
        "adservice", "adserver", "adskeeper", "mgid", "taboola", "outbrain",
        "realsrv", "wigetmedia", "yieldmo", "bidswitch", "rubiconproject",
        "popunder", "clicktag", "adclick", "pushdown", "adtrue", "adcash",
        "infolinks", "adtarget", "yllix", "revenuehits", "popcash", "zeroredirect1",
        "fastclick", "trafficfactory", "ero-advertising", "juicyads", "tubecorporate",
        "trackvoluum", "voluumtrk", "adform", "smartadserver", "adroll", "criteo",
        "quantserve", "scorecardresearch", "hotjar", "adcolony", "applovin", "vungle",
        "adsupply", "popmyads", "adbuffs", "bidvertiser", "clickadu", "propeller"
    };

    private static final Set<String> ALLOWED_STREAMING_HOSTS = new HashSet<>(Arrays.asList(
        "localhost", "127.0.0.1", "capacitor",
        "vidlink.pro", "vidsrc.cc", "vidsrc.icu", "vidsrc.me", "vidsrc.to", "vidsrc.net", "vidsrc.pro",
        "embed.su", "autoembed.cc", "player.autoembed.cc", "multiembed.mov",
        "smashystream.com", "embed.smashystream.com", "2embed.cc", "www.2embed.cc",
        "youtube.com", "www.youtube.com", "youtu.be", "googlevideo.com",
        "themoviedb.org", "tmdb.org", "api.themoviedb.org", "image.tmdb.org",
        "supabase.co", "dicebear.com", "api.dicebear.com", "tvmaze.com", "api.tvmaze.com",
        "watchmode.com", "api.watchmode.com", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"
    ));

    private static boolean isAdOrTracker(String host, String fullUrl) {
        if (host == null) return false;
        String lowerHost = host.toLowerCase();
        String lowerUrl = fullUrl != null ? fullUrl.toLowerCase() : "";

        // Check if host matches any ad keyword
        for (String adKeyword : AD_KEYWORDS) {
            if (lowerHost.contains(adKeyword) || lowerUrl.contains("/" + adKeyword)) {
                return true;
            }
        }

        // Common ad script and popunder URL patterns
        if (lowerUrl.contains("/popunder") || lowerUrl.contains("/ads.js") || 
            lowerUrl.contains("/pop.js") || lowerUrl.contains("/ad-provider") ||
            lowerUrl.contains("redirect_url=") || lowerUrl.contains("/clicktag") ||
            lowerUrl.contains("ad_type=") || lowerUrl.contains("banner.php")) {
            return true;
        }

        return false;
    }

    private static boolean isAllowedHost(String host) {
        if (host == null) return false;
        String lowerHost = host.toLowerCase();
        for (String allowed : ALLOWED_STREAMING_HOSTS) {
            if (lowerHost.equals(allowed) || lowerHost.endsWith("." + allowed)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Force hardware acceleration for high-framerate HD video output (60fps/120fps)
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // 2. Display optimization for high-refresh phones (like Infinix Zero 5G 120Hz display)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Display display = getDisplay();
                if (display != null) {
                    Display.Mode[] modes = display.getSupportedModes();
                    Display.Mode maxRefreshMode = null;
                    for (Display.Mode mode : modes) {
                        if (maxRefreshMode == null || mode.getRefreshRate() > maxRefreshMode.getRefreshRate()) {
                            maxRefreshMode = mode;
                        }
                    }
                    if (maxRefreshMode != null) {
                        WindowManager.LayoutParams params = getWindow().getAttributes();
                        params.preferredDisplayModeId = maxRefreshMode.getModeId();
                        getWindow().setAttributes(params);
                    }
                }
            }

            // 3. Support punch-hole and notch camera cutouts (Infinix Zero 5G display)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                getWindow().getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onStart() {
        super.onStart();

        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;

            WebView webView = bridge.getWebView();
            if (webView == null) return;

            WebSettings settings = webView.getSettings();

            // 1. Anti-popup & anti-hijack settings
            settings.setSupportMultipleWindows(false);
            settings.setJavaScriptCanOpenWindowsAutomatically(false);

            // 2. High-performance video & rendering settings for 1080p FHD+ mobile displays
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);

            // Enable layer hardware rendering
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

            // 3. Native uBlock Origin / Brave Shields Engine via custom BridgeWebViewClient
            BridgeWebViewClient adBlockClient = new BridgeWebViewClient(bridge) {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    if (request != null && request.getUrl() != null) {
                        Uri uri = request.getUrl();
                        String url = uri.toString();
                        String host = uri.getHost();

                        // Block known ad networks and tracking beacons
                        if (isAdOrTracker(host, url)) {
                            // Return empty response (stops ad from downloading or executing)
                            return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream("".getBytes()));
                        }
                    }
                    return super.shouldInterceptRequest(view, request);
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (request == null || request.getUrl() == null) return true;

                    Uri uri = request.getUrl();
                    String url = uri.toString().toLowerCase();
                    String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
                    String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";

                    // Block app hijacks (Play Store, intent, market, tel)
                    if (scheme.equals("intent") || scheme.equals("market") || scheme.equals("itms-appss") ||
                        scheme.equals("tel") || scheme.equals("sms") || scheme.equals("mailto")) {
                        return true;
                    }

                    // Allow local app content
                    if (host.equals("localhost") || host.equals("127.0.0.1") || scheme.equals("capacitor")) {
                        return super.shouldOverrideUrlLoading(view, request);
                    }

                    // Block known ad redirectors immediately
                    if (isAdOrTracker(host, url)) {
                        return true;
                    }

                    // If it is an authorized video embed stream, allow it inside the iframe
                    if (isAllowedHost(host)) {
                        return false;
                    }

                    // Block main frame redirects to unwanted sites
                    if (request.isForMainFrame()) {
                        return true;
                    }

                    return true;
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    // Inject script to defuse window.open and popup events inside webview
                    try {
                        String defuserJs = 
                            "(function() {" +
                            "  try {" +
                            "    window.open = function() { return null; };" +
                            "    window.alert = function() { return true; };" +
                            "    window.confirm = function() { return false; };" +
                            "  } catch(e) {}" +
                            "})();";
                        view.evaluateJavascript(defuserJs, null);
                    } catch (Exception ignored) {}
                }
            };

            webView.setWebViewClient(adBlockClient);

            // 4. Block window.open popups at the WebChromeClient layer
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                    // Suppress any attempt to create a popup window
                    return false;
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
