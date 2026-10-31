package com.watchflix.app;

import android.os.Bundle;
import android.os.Message;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                
                // 1. Completely disable multiple windows / popup tabs from iframes
                settings.setSupportMultipleWindows(false);
                
                // 2. Prevent JavaScript from opening windows automatically (anti-popup)
                settings.setJavaScriptCanOpenWindowsAutomatically(false);
                
                // 3. Enable DOM storage and media playback without user gesture
                settings.setDomStorageEnabled(true);
                settings.setMediaPlaybackRequiresUserGesture(false);

                // 4. Intercept any programmatic popup requests at the Chrome client level
                webView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                        // Drop popups immediately without opening any secondary window
                        return false;
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
