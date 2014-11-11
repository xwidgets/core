package org.xwidgets.websocket;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * Broadcast messages are transmitted to the client to indicate a change in project state
 *
 * @author Shane Bryzak
 */
public class Message implements Serializable
{
   private static final long serialVersionUID = -7283438779264064519L;

   // Message key
   private String key;

   // Message payload
   private Map<String,Object> payload = new HashMap<String,Object>();

   public Message(String key)
   {
      this.key = key;
   }

   public String getKey()
   {
      return key;
   }

   public void setPayloadValue(String name, Object value)
   {
      payload.put(name, value);
   }

   public Map<String,Object> getPayload()
   {
      return payload;
   }
}
