#include <Adafruit_CC3000.h>
#include <SPI.h>
#include <SoftwareSerial.h>

int tableID = 1;
int wifiPin = 6;
int readLed = 7;
long previousMillis = 0; 
byte bytesread = 0;
long interval = 5000; 
boolean nodeConnected = false;

// Digital pins
#define RESET_PIN         4
#define RFID_RX           9
#define RFID_TX           8 // not used
#define RESET_LED_PIN     13
SoftwareSerial rfidSerial(RFID_RX, RFID_TX);

// These are the interrupt and control pins
#define ADAFRUIT_CC3000_IRQ   3  // MUST be an interrupt pin!
// These can be any two pins
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10
// Use hardware SPI for the remaining pins
// On an UNO, SCK = 13, MISO = 12, and MOSI = 11
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT, SPI_CLOCK_DIVIDER); 
Adafruit_CC3000_Client www;

#define WLAN_SSID       "Something"
#define WLAN_PASS       "featuredInDotNet100"

// Security can be WLAN_SEC_UNSEC, WLAN_SEC_WEP, WLAN_SEC_WPA or WLAN_SEC_WPA2
#define WLAN_SECURITY   WLAN_SEC_WPA2

// IP and port of netServer we are sending events to
const uint8_t   SERVER_IP[4]   = { 
  0, 0, 0, 0 };
const uint16_t  SERVER_PORT    = 0000;

/* Amount of time to wait (in milliseconds) with no data 
 received before closing the connection.  If you know the server
 you're accessing is quick to respond, you can reduce this value.                            
 software serial connection for rfid reader */
#define IDLE_TIMEOUT_MS  30000  

void setup(void)
{
  // Setup serial monitor for debugging
  Serial.begin(115200);

  // Setup serial connection to RFID reader
  rfidSerial.begin(9600);

  pinMode(wifiPin, OUTPUT);
  pinMode(readLed, OUTPUT);

  digitalWrite(readLed, HIGH);
  digitalWrite(wifiPin, HIGH);

  Serial.println(F("\nInitializing..."));

  if(!cc3000.begin()) {
    Serial.println(F("Couldn't begin()! Check your wiring?"));
    while(1);
  }

  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
    Serial.println(F("Failed!"));
    while(1);
  }

  Serial.println(F("Connected to WIFI!"));

  // Wait for DHCP to complete
  Serial.println(F("Request DHCP"));
  while (!cc3000.checkDHCP()) {
    delay(100); // ToDo: Insert a DHCP timeout!
  }   

  Serial.println(F("Listen for a card to be read"));
  imAlive();
}


void loop () {
  byte i = 0;
  byte val = 0;
  byte code[6];
  byte checksum = 0;
  byte bytesread = 0;
  byte tempbyte = 0;

  if(rfidSerial.available() > 0) {

    // Check for header 
    if((val = rfidSerial.read()) == 2) {                  
      bytesread = 0; 
      digitalWrite(readLed, HIGH);

      // Read 10 digit code + 2 digit checksum
      while (bytesread < 12) {                        
        if( rfidSerial.available() > 0) { 

          val = rfidSerial.read();

          // If header or stop bytes before the 10 digit reading, stop reading
          if((val == 0x0D)||(val == 0x0A)||(val == 0x03)||(val == 0x02)) { 
            break;
          }

          // Do Ascii/Hex conversion
          if ((val >= '0') && (val <= '9')) {
            val = val - '0';
          } 
          else if ((val >= 'A') && (val <= 'F')) {
            val = 10 + val - 'A';
          }

          // Every two hex-digits, add byte to code:
          if (bytesread & 1 == 1) {

            // Make some space for this hex-digit by
            // shifting the previous hex-digit with 4 bits to the left:
            code[bytesread >> 1] = (val | (tempbyte << 4));

            // If we're at the checksum byte,
            if (bytesread >> 1 != 5) {                
              // Calculate the checksum... (XOR)
              checksum ^= code[bytesread >> 1];       
            };
          } 
          else {
            // Store the first hex digit first
            tempbyte = val;                           
          };
          // Ready to read next digit
          bytesread++;                               
        } 
      } 

      // Output to Serial
      if (bytesread == 12) { 
        int count = 0;
        int i;
        char* bufStr = (char*) malloc (2*sizeof(code) + 1);
        char* bufPtr = bufStr;

        bufPtr += sprintf(bufPtr, "tableID=%d:", tableID);

        // If 12 digit read is complete
        Serial.print("5-byte code: ");

        for (i=0; i<6; i++) {
          if (code[i] < 16) {
            Serial.print("0");
          }
          Serial.print(code[i], HEX);

          bufPtr += sprintf(bufPtr, "%02X", code[i]);

          Serial.print(" ");
        }

        sendToServer(bufStr);

        Serial.println();
        Serial.print("Checksum: ");
        Serial.print(code[5], HEX);
        Serial.println(code[5] == checksum ? " -- passed." : " -- error.");
        Serial.println();

        delay(1000);
        digitalWrite(readLed, LOW);
      }

      bytesread = 0;
    }
  }
  unsigned long currentMillis = millis();

  if(currentMillis - previousMillis > interval) {
    previousMillis = currentMillis;
    wifiLed();
    imAlive();
  }
}

// Send message to netServer
void sendToServer(char* string) {
  flashLed();
  if (www.connected()){       
    www.fastrprint(string);
    deviceReadAndSent();
  }
}

// Flash red LED while connecting to the server
void flashLed() {
  www.close();
  while(!www.connected()){

    www = cc3000.connectTCP(cc3000.IP2U32(SERVER_IP[0], SERVER_IP[1], SERVER_IP[2], SERVER_IP[3]), SERVER_PORT);
    digitalWrite(wifiPin, HIGH);
    delay(500);
    digitalWrite(wifiPin, LOW);
    delay(500);

    Serial.println(F("\nTrying to connect to server..."));
  }
  digitalWrite(wifiPin, HIGH);

}

void imAlive() {
  www = cc3000.connectTCP(cc3000.IP2U32(SERVER_IP[0], SERVER_IP[1], SERVER_IP[2], SERVER_IP[3]), SERVER_PORT);
  char online [25];
  int n;
  n = sprintf(online, "tableID=%d:online", tableID);
  www.fastrprint(online);
  www.close();

  Serial.println(F("Sent alive packet"));
}

void wifiLed() {
  if (!cc3000.checkConnected()) {
    digitalWrite(readLed, HIGH);
    delay(200);
    digitalWrite(readLed, LOW);
    delay(200);
    digitalWrite(readLed, HIGH);
    delay(200);
    digitalWrite(readLed, LOW);
    delay(200);
    digitalWrite(readLed, HIGH);
    cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY);

  } 
  else {
    digitalWrite(readLed, LOW);
  }
}
void deviceReadAndSent() {
  digitalWrite(wifiPin, LOW);
  delay(100);
  digitalWrite(wifiPin, HIGH);
  delay(100);
  digitalWrite(wifiPin, LOW);
  delay(100);
  digitalWrite(wifiPin, HIGH);

  Serial.println(F("\nSent message"));
}