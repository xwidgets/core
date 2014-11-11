package org.xwidgets.websocket;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.enterprise.event.Observes;
import javax.enterprise.inject.spi.AnnotatedMethod;
import javax.enterprise.inject.spi.AnnotatedType;
import javax.enterprise.inject.spi.Extension;
import javax.enterprise.inject.spi.ProcessAnnotatedType;
import javax.websocket.Session;

import org.apache.deltaspike.core.api.provider.BeanProvider;
import org.apache.deltaspike.core.util.ReflectionUtils;

/**
 * Registers message handlers and delegates message processing to the appropriate handler method
 *
 * @author Shane Bryzak
 */
public class MessageHandlerFactory implements Extension
{
   /**
    * Contains message key:method mappings
    */
   private Map<String,Method> handlers = new HashMap<String,Method>();

   public <X> void processAnnotatedType(@Observes ProcessAnnotatedType<X> event)
   {
      AnnotatedType<X> type = event.getAnnotatedType();

        for (final AnnotatedMethod<? super X> m : type.getMethods())
        {
           if (m.isAnnotationPresent(MessageHandler.class))
           {
              MessageHandler handler = m.getAnnotation(MessageHandler.class);
              handlers.put(handler.value(), m.getJavaMember());
           }
        }
   }

   public void handleMessage(Message msg, Session session) throws IllegalAccessException
   {
      Method m = handlers.get(msg.getKey());
      if (m != null)
      {
        List<?> refs = BeanProvider.getContextualReferences(m.getDeclaringClass(), false);
        if (refs.size() != 1)
        {
           throw new IllegalStateException("Ambiguous message handlers found for message: " + msg);
        }
        ReflectionUtils.invokeMethod(refs.get(0), m, null, true, msg, session);
      }
   }
}
