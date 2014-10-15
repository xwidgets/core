package org.xwidgets;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This servlet serves XWidgets resource such as scripts
 * 
 * @author Shane Bryzak
 *
 */
@WebServlet(urlPatterns={"/xwidgets/*", "/views/*"})
public class XWidgetsResourceServlet extends HttpServlet {

    private static final long serialVersionUID = -4259869188091639565L;

    private Pattern widgetResourcePattern;
    private Pattern viewResourcePattern;

    private Map<String,byte[]> resourceCache = new HashMap<String,byte[]>();

    @Override
    public void init() {
        widgetResourcePattern = Pattern.compile(getServletContext().getContextPath() + "/xwidgets/(.*)");
        viewResourcePattern = Pattern.compile(getServletContext().getContextPath() + "/views/(.*)");
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
//        if (request.getRequestURI().startsWith(prefix))

        String resourcePath = null; // = getResourcePath(request.getRequestURI());

        Matcher m = widgetResourcePattern.matcher(request.getRequestURI());
        if (m.matches()) {
            if (request.getPathInfo().endsWith(".js")) {
               response.setContentType("text/javascript");
            } else if (request.getPathInfo().endsWith(".css")) {
                response.setContentType("text/css");
            } else if (request.getPathInfo().endsWith(".png")) {
                response.setContentType("image/png");
            } else if (request.getPathInfo().endsWith(".gif")) {
                response.setContentType("image/gif");
            }
            resourcePath = m.group(1);
        } else {
            m = viewResourcePattern.matcher(request.getRequestURI());
            if (m.matches()) {
                response.setContentType("text/xml");
                resourcePath = "/WEB-INF/views/" + m.group(1);
            }
        }

        if (resourcePath == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        } else {
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setDateHeader("Expires", 0);
            response.setStatus(streamResource(response.getOutputStream(), resourcePath));
        }
    }

    private int streamResource(OutputStream out, String path) throws IOException {
        if (!resourceCache.containsKey(path)) {
            cacheResource(path);
        }

        if (resourceCache.containsKey(path)) {
            out.write(resourceCache.get(path));
            out.flush();
            return HttpServletResponse.SC_OK;
        } else {
            return HttpServletResponse.SC_NOT_FOUND;
        }
    }

    private void cacheResource(String path) throws IOException {
        URL resourceUrl;

        try {
            resourceUrl = getServletContext().getResource(path);
        } catch (Exception ex) {
            resourceUrl = getClass().getClassLoader().getResource(path);
        }

        if (resourceUrl != null) {
            InputStream is = resourceUrl.openStream();
            byte[] buffer = new byte[1024];
            ByteArrayOutputStream os = new ByteArrayOutputStream();

            int read = is.read(buffer);
            while (read != -1) {
                os.write(buffer, 0, read);
                read = is.read(buffer);
            }

            resourceCache.put(path, os.toByteArray());
        }
    }

}
