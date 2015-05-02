#include <Adafruit_CC3000.h>
#include <SoftwareSerial.h>
#include <SPI.h>
#include <avr/wdt.h>

int tableID = 1; 
int redLed = 6;
int blueLed = 5;

// Digital pins
#define RFID_RX           9
#define RFID_TX           8 // not used

SoftwareSerial rfidSerial(RFID_RX, RFID_TX);

// CC3000 interrupt and control pins
#define ADAFRUIT_CC3000_IRQ   2 // MUST be an interrupt pin!
#define ADAFRUIT_CC3000_VBAT  7 // These can be
#define ADAFRUIT_CC3000_CS   10 // any two pins

// Hardware SPI required for remaining pins.
// On an UNO, SCK = 13, MISO = 12, and MOSI = 11
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS,
ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT, SPI_CLOCK_DIV2);

// WiFi access point credentials
#define WLAN_SSID     "YOUR_SSID"  // 32 characters max
#define WLAN_PASS     "YOUR_PASSWORD"
#define WLAN_SECURITY WLAN_SEC_WPA2 // WLAN_SEC_UNSEC/WLAN_SEC_WEP/WLAN_SEC_WPA/WLAN_SEC_WPA2

// IP and port of netServer we are sending events to
const uint8_t   
  SERVER_IP[4] = { 0, 0, 0, 0 };
  
const uint16_t  
  SERVER_PORT = 0000;
  
// Intervals
const unsigned long
  alivePingInterval = 15L * 1000L; // Time to wait before sending another alive packet
  
unsigned long previousAlivePingMillis = 0;

void setup() {
  
  // reset watchdog
  wdt_reset();
  
  // disable watchdog
  wdt_disable();
  
  // Setup serial monitor for debugging
  //Serial.begin(115200);
  
  pinMode(redLed, OUTPUT);
  pinMode(blueLed, OUTPUT);
  
  digitalWrite(redLed, LOW);
  digitalWrite(blueLed, LOW);
  
  delay(1000);

  digitalWrite(redLed, HIGH);
  digitalWrite(blueLed, HIGH);
  
  //Serial.print(F("\nInitializing CC3000..."));
  
  if(!cc3000.begin()) {
    //Serial.println(F("Couldn't begin()! Check your wiring?"));
    while(1);
  }
  
  redBlink();
  
  // reset watchdog
  wdt_reset();
  
  //Serial.print(F("OK\r\nConnecting to WiFi network..."));
  cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY);
  
  redBlink();
  
  // reset watchdog
  wdt_reset();
  
  //Serial.print(F("OK\r\nRequesting DHCP address..."));
  while (!cc3000.checkDHCP()) {
    delay(100);
  }
  //Serial.println(F("OK"));
  
  redBlink();
  
  // reset watchdog
  wdt_reset();
  
  // Initialize the serial connection to the RFID reader
  rfidSerial.begin(9600);
  //Serial.println(F("Listen for a card to be read"));
  
  // start watchdog 
  enable_watchdog();
  
  // send an alive ping
  imAlive();
  
}

void loop() {
  
  // listen for an RFID scan
  listenForRFID();
  
  // reset watchdog
  wdt_reset();
  
  // let the server know that we are connected each 'alive interval'
  if((millis() - previousAlivePingMillis) > alivePingInterval) {
    imAlive();
  }
  
}

void listenForRFID(void) {
  
  byte i = 0;
  byte val = 0;
  byte code[6];
  byte checksum = 0;
  byte bytesread = 0;
  byte tempbyte = 0;
  
  if(rfidSerial.available() > 0) {
    val = rfidSerial.read();
    //Serial.println("Read Value:");
    //Serial.println(val);
    if(val == 2) {                   // check for header 
      bytesread = 0;
      
      ledStateDetectedRFID();        // update LED state
      
      while (bytesread < 12) {                        // read 10 digit code + 2 digit checksum
        if( rfidSerial.available() > 0) { 
          val = rfidSerial.read();
          if((val == 0x0D)||(val == 0x0A)||(val == 0x03)||(val == 0x02)) { // if header or stop bytes before the 10 digit reading 
            break;                                    // stop reading
          }

          // Do Ascii/Hex conversion:
          if ((val >= '0') && (val <= '9')) {
            val = val - '0';
          } else if ((val >= 'A') && (val <= 'F')) {
            val = 10 + val - 'A';
          }

          // Every two hex-digits, add byte to code:
          if (bytesread & 1 == 1) {
            // make some space for this hex-digit by
            // shifting the previous hex-digit with 4 bits to the left:
            code[bytesread >> 1] = (val | (tempbyte << 4));

            if (bytesread >> 1 != 5) {                // If we're at the checksum byte,
              checksum ^= code[bytesread >> 1];       // Calculate the checksum... (XOR)
            };
          } else {
            tempbyte = val;                           // Store the first hex digit first...
          };

          bytesread++;                                // ready to read next digit
        } 
      } 

      // Output to Serial:

      if (bytesread == 12) {        // if 12 digit read is complete
        char* bufStr = (char*) malloc (2*sizeof(code) + 1);
        char* bufPtr = bufStr;

        bufPtr += sprintf(bufPtr, "tableID=%d:", tableID);
      
        //Serial.print("5-byte code: ");
        for (i=0; i<5; i++) {
          if (code[i] < 16) Serial.print("0");
          //Serial.print(code[i], HEX);
          //Serial.print(" ");
          bufPtr += sprintf(bufPtr, "%02X", code[i]);
        }
        
        sendToServer(bufStr);      // send the scanned RFID to the net server
        
        //Serial.println();
        //Serial.print("Checksum: ");
        //Serial.print(code[5], HEX);
        //Serial.println(code[5] == checksum ? " -- passed." : " -- error.");
        //Serial.println();
        
      }
      bytesread = 0;
    }
  }
}

void sendToServer(char* string) {
  
  // close the serial port while we attempting to send
  rfidSerial.end();
  
  // check connection to WiFi
  //Serial.print(F("\n\nChecking WiFi connection..."));
  if(!cc3000.checkConnected()){while(1){}}
  //Serial.println(F("OK."));
  
  // reset watchdog
  wdt_reset();
  
  // send the scanned RFID string
  Adafruit_CC3000_Client client = cc3000.connectTCP(cc3000.IP2U32(SERVER_IP[0], SERVER_IP[1], SERVER_IP[2], SERVER_IP[3]), SERVER_PORT);
  if (client.connected()) {
    
    //Serial.print(F("Sending RFID scan..."));
    
    // send the scanned RFID
    client.fastrprint(string);
    
    // indicate that the RFID was sent successfully
    sendSuccessBlink();
    //Serial.println(F("Success"));
    
  } else {
    
      // indicate that the RFID failed to send
      sendFailiureBlink();
      //Serial.println(F("Could not send RFID. Not connected!"));
      
  }
  
  // reset watchdog
  wdt_reset();
   
  // close connection and disconnect
  //Serial.println(F("Closing connection"));
  client.close();
  
  // reset watchdog
  wdt_reset();
  
  // wait a few seconds before accepting another scan
  ledStateWaiting();
  
  // delay for one second
  wait(1000);
  
  // re-initialize the serial port
  rfidSerial.begin(9600);
  
  // go back to the alive state
  ledStateAlive();
  
  // reset watchdog
  wdt_reset();
  
}

void imAlive() {
  
  // close the serial port while we attempting to send
  rfidSerial.end();
  
  // check connection to WiFi
  //Serial.print(F("\n\nChecking WiFi connection..."));
  if(!cc3000.checkConnected()){while(1){}}
  //Serial.println(F("OK."));
  
  // reset watchdog
  wdt_reset();
  
  // send the alive packet
  Adafruit_CC3000_Client client = cc3000.connectTCP(cc3000.IP2U32(SERVER_IP[0], SERVER_IP[1], SERVER_IP[2], SERVER_IP[3]), SERVER_PORT);
  if (client.connected()) {
    
    //Serial.print(F("Sending alive packet..."));
    
    // send an alive packet
    char online [25];
    int n;
    n = sprintf(online, "tableID=%d:online", tableID);
    client.fastrprint(online);
    
    // set the LED state
    ledStateAlive();
    //Serial.println(F("Success"));
    
  } else {
    
    // indicate that the alive packet failed to send
    sendFailiureBlink();
    //Serial.println(F("Could not send alive packet. Not connected!"));
    
  }
  
  // reset watchdog
  wdt_reset();
   
  // close connection and disconnect
  //Serial.println(F("Closing connection"));
  client.close();
  
  // reset watchdog
  wdt_reset();
  
  // wait a few seconds before accepting another scan
  ledStateWaiting();
  
  // delay for one second
  wait(1000);
  
  // re-initialize the serial port
  rfidSerial.begin(9600);
  
  // go back to the alive state
  ledStateAlive();
  
  // reset watchdog
  wdt_reset();
  
  // update the time that the last alive ping was sent
  previousAlivePingMillis = millis();
  
}

/*********** 
 LED states
************/
void ledStateAlive() 
{
  digitalWrite(redLed, HIGH);
  digitalWrite(blueLed, LOW);
}

void ledStateDetectedRFID() 
{
  digitalWrite(redLed, HIGH);
  digitalWrite(blueLed, HIGH);
}

void ledStateWaiting() 
{
  digitalWrite(redLed, HIGH);
  digitalWrite(blueLed, HIGH);
}

/******************
 LED blink patterns
*******************/
void sendSuccessBlink() 
{
  blinkLed(redLed, blueLed, 4, 100, false); // success blink
  ledStateAlive(); // restore alive state
}

void sendFailiureBlink() 
{
  blinkLed(redLed, blueLed, 4, 500, false); // fail blink
  ledStateAlive();
}

void alivePingFailiureBlink() 
{
  blinkLed(redLed, blueLed, 6, 500, true); // fail blink
  ledStateAlive();
}

void redBlink() 
{
  blinkLed(redLed, 0, 1, 200, false); // 1 blink
}

/*******
 Helpers
********/
void blinkLed(int pin1, int pin2, unsigned long totalBlinks, unsigned long period, boolean alternate) 
{  
  unsigned long totalInterval = totalBlinks * (2L * period) + period;
  unsigned long t = millis();
  unsigned long previousMillis = 0;
  int ledState = LOW;
  
  do {
   if ((millis() - previousMillis) > period) {
     // alternate the LED state each interval
     if (ledState == LOW) {
       ledState = HIGH;
     }
     else {
       ledState = LOW;
     }
     
     // turn on the requested pin
     if (pin1 > 0) {
       digitalWrite(pin1, ledState);
     }
     if (pin2 > 0) {
       if (alternate) {
         digitalWrite(pin2, !ledState);
       }
       else {
         digitalWrite(pin2, ledState);
       }
     }
     previousMillis = millis();
   }
  } 
  while ((millis() - t) < totalInterval);
}

void wait(unsigned long total_delay) {
  
  unsigned long t = millis();
  do {
    // Wait; Do Nothing
  }
  while ((millis() - t) < total_delay);
  
}

void enable_watchdog(void)
{
  cli(); // disable all interrupts
  wdt_reset(); // reset the WDT timer
  WDTCSR |= (1<<WDCE) | (1<<WDE); 
  WDTCSR = (1<<WDIE) | (1<<WDE) | (1<<WDP3) | (1<<WDP2) | (1<<WDP1) | (1<<WDP0);
  sei();
}
