package org.xwidgets.websocket;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.inject.Qualifier;

/**
 * Annotate a method as a web socket message handler endpoint.  The value member
 * serves as the message handler key, for which each handler should be assigned a 
 * unique, non-empty value.
 *
 * @author Shane Bryzak
 */
@Qualifier
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface MessageHandler
{
   String value() default "";
}
