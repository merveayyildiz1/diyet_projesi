import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_application_2/services/data_service.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';


class ClientHomePage extends StatefulWidget {
  final int userId;
  const ClientHomePage({super.key, required this.userId});
  State<ClientHomePage> createState() => _ClientHomePageState();
 
}


class _ClientHomePageState extends State<ClientHomePage> {
  int _selectedIndex = 0; // Hangi sekme seçili
  DateTime _selectedDay = DateTime.now();
  DateTime _focusedDay = DateTime.now();

  final DataService _dataService = DataService(); //asistan
  final _kiloController = TextEditingController(); //kilo girişi için
  bool _isLoading = false; 

  final _foodNameController = TextEditingController(); //yemek adı için
  String _selectedMealType = 'Kahvaltı';

  DateTime _selectedAppointmentDate = DateTime.now(); // Randevu tarihi
  TimeOfDay _selectedAppointmentTime = TimeOfDay.now(); // Randevu saati
  final _notesController = TextEditingController(); // Randevu notları
  int? _assignedDietitianId; // Diyetisyen ID'si, API'den çekilecek
  
   //varsayılan öğün türü
  final List<String> _mealTypes = [
    'Kahvaltı',
    'Öğle Yemeği',
    'Akşam Yemeği',
    'Ara Öğün',
  ];
 late Future<Map<String, dynamic>> _clientAppointmentsFuture;

 @override
  void initState() {
    super.initState();
    initializeDateFormatting('tr_TR', null);
    _loadClientAppointments();
  }

  void _loadClientAppointments() {
    setState(() {
      _clientAppointmentsFuture = _dataService.getAppointmentsForClient(widget.userId);
    });
  } 
   

@override
  void dispose() {
    _kiloController.dispose();
    _foodNameController.dispose();
    super.dispose();
  }


  // Sekme değiştiğinde çağrılır
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  // Her sekme için içerik
  Widget _getPage(int index) {
    switch (index) {
      case 0:
        return _buildHomePage(); // Ana Sayfa
      case 1:
        return _buildMenuPage(); // Günlük Menü
      case 2:
        return _buildStatsPage(); // İstatistikler
      case 3:
        return  _buildAppointmentPage();  // Sohbet
      case 4:
         return  _buildChatPage();  // Randevu
      default:
        return _buildHomePage();
    }
  }

  // --- YENİ EKLENEN YARDIMCI METOTLAR (Adım 3.4) ---

  // API'den hata gelirse göstermek için
  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Bir Hata Oluştu'),
        content: Text(message),
        actions: <Widget>[
          TextButton(
            child: const Text('Tamam'),
            onPressed: () {
              Navigator.of(ctx).pop();
            },
          )
        ],
      ),
    );
  }

  // "Kilo Ekle" butonuna basıldığında bu popup'ı göster
  void _showAddWeightDialog() {
    _kiloController.clear(); // Popup açıldığında kutuyu temizle
    showDialog(
      context: context,
      builder: (ctx) {
        // Yüklenme durumunu yönetmek için bir StatefulBuilder kullanıyoruz
        bool isDialogLoading = false;
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Kilo Ekle'),
              content: TextField(
                controller: _kiloController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Kilo (örn: 75.5)',
                ),
                enabled: !isDialogLoading, // Yüklenirken kilitle
              ),
              actions: [
                TextButton(
                  child: const Text('İptal'),
                  onPressed: () {
                    Navigator.of(ctx).pop();
                  },
                ),
                ElevatedButton(
                  // Yükleniyorsa butonu kilitle
                  onPressed: isDialogLoading ? null : () async {
                    final String kiloText = _kiloController.text;
                    if (kiloText.isEmpty) {
                      return; // Boşsa kaydetme
                    }
                    
                    final double? kilo = double.tryParse(kiloText.replaceAll(',', '.')); // Virgülü noktaya çevir
                    if (kilo == null || kilo <= 0) {
                      return; // Geçersiz sayıysa kaydetme
                    }

                    setDialogState(() {
                      isDialogLoading = true; // Yükleniyor...
                    });

                    // --- API'Yİ ÇAĞIR ---
                    // "widget.userId" sayesinde hangi kullanıcı olduğunu biliyoruz!
                    final result = await _dataService.addWeight(widget.userId, kilo);
                    // --- BİTİŞ ---

                    if (!mounted) return; // Sayfa kapandıysa devam etme

                    Navigator.of(ctx).pop(); // Popup'ı kapat

                    if (result['success'] == true) {
                      // Başarılı!
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Kilo başarıyla kaydedildi!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    } else {
                      // Hata oluştu
                      _showErrorDialog(result['message']);
                    }
                  },
                  // Yükleniyorsa dönen ikon göster
                  child: isDialogLoading 
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                      : const Text('Kaydet'),
                ),
              ],
            );
          }
        );
      },
    );
  }

  // --- YEMEK EKLEME İÇİN YENİ POPUP METODU ---
  void _showAddMealDialog() {
    // Formları temizle
    _foodNameController.clear();
    _selectedMealType = 'Kahvaltı'; // Varsayılana sıfırla

    showDialog(
      context: context,
      builder: (ctx) {
        bool isDialogLoading = false;
        // Dropdown'ın güncellenmesi için popup içinde bir StatefulBuilder kullanıyoruz
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text('${_selectedDay.day}/${_selectedDay.month} Tarihine Öğün Ekle'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Öğün Tipi Seçimi
                    DropdownButtonFormField<String>(
                      value: _selectedMealType,
                      items: _mealTypes.map((String type) {
                        return DropdownMenuItem<String>(
                          value: type,
                          child: Text(type),
                        );
                      }).toList(),
                      onChanged: (String? newValue) {
                        setDialogState(() {
                          _selectedMealType = newValue!;
                        });
                      },
                      decoration: const InputDecoration(labelText: 'Öğün Tipi'),
                    ),
                    const SizedBox(height: 10),
                    // Yemek Adı
                    TextField(
                      controller: _foodNameController,
                      decoration: const InputDecoration(labelText: 'Yemek Adı (örn: Elma)'),
                      enabled: !isDialogLoading,
                    ),
                    const SizedBox(height: 10),
                    
                  ],
                ),
              ),
              actions: [
                TextButton(
                  child: const Text('İptal'),
                  onPressed: () {
                    Navigator.of(ctx).pop();
                  },
                ),
                ElevatedButton(
                  onPressed: isDialogLoading ? null : () async {
                    // Verileri al ve doğrula
                    setDialogState(() {
                      isDialogLoading = true;
                    });
            
                    final String foodName = _foodNameController.text;
                    if (foodName.isEmpty) {
                      return; // Boşsa kaydetme
                    }

                    setDialogState(() {
                      isDialogLoading = true;
                    });

                    // --- API'Yİ ÇAĞIR ---
                    final result = await _dataService.addMeal(
                      userId: widget.userId,
                      foodName: foodName,
                
                      mealType: _selectedMealType,
                      dateEaten: _selectedDay, // Ana sayfadaki takvimden seçili gün
                    );
                    // --- BİTİŞ ---

                    if (!mounted) return;
                    Navigator.of(ctx).pop(); // Popup'ı kapat

                    if (result['success'] == true) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Öğün başarıyla kaydedildi!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                     setState(() {
                        // Menü sayfasını yenilemek için
                      });
                    } else {
                      _showErrorDialog(result['message']);
                    }
                  },
                  child: isDialogLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Kaydet'),
                ),
              ],
            );
          },
        );
      },
    );
  }

// 1) ANA SAYFA
  Widget _buildHomePage() {
    return Column(
      children: [
        // Takvim
        TableCalendar(
          firstDay: DateTime.utc(2020, 1, 1),
          lastDay: DateTime.utc(2030, 12, 31),
          focusedDay: _focusedDay,
          selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
          onDaySelected: (selectedDay, focusedDay) {
            setState(() {
              _selectedDay = selectedDay;
              _focusedDay = focusedDay;
            });
          },
          calendarFormat: CalendarFormat.week,
          headerStyle: const HeaderStyle(
            formatButtonVisible: false,
            titleCentered: true,
          ),
          calendarStyle: const CalendarStyle(
            todayDecoration: BoxDecoration(
              color: Color.fromARGB(255, 0, 0, 0),
              shape: BoxShape.circle,
            ),
            selectedDecoration: BoxDecoration(
              color: Color.fromARGB(255, 125, 153, 92),
              shape: BoxShape.circle,
            ),
          ),
        ),
        const SizedBox(height: 10),
       Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            'Aktif Randevular',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 10),

        Expanded(
          child: FutureBuilder<Map<String, dynamic>>(
            future: _clientAppointmentsFuture,
            builder: (context, snapshot) {
              
              // Yükleniyor...
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(child: CircularProgressIndicator());
              }

              // Hata...
              if (!snapshot.hasData || snapshot.data!['success'] == false) {
                return Center(
                  child: Text(
                    'Randevular yüklenemedi.',
                    style: TextStyle(color: Colors.red),
                  ),
                );
              }

              // Veri geldi, 'Onaylandı' olanları filtrele
              final List allAppointments = snapshot.data!['data'];
              final List approvedAppointments = allAppointments
                  .where((a) => a['Status'] == 'Onaylandı')
                  .toList();

              // Onaylanmış randevu yoksa
              if (approvedAppointments.isEmpty) {
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16.0),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  color: const Color.fromARGB(255, 230, 230, 230),
                  child: ListTile(
                    leading: Icon(Icons.info_outline, color: Colors.grey.shade700),
                    title: Text(
                      'Aktif randevunuz bulunmuyor.',
                      style: TextStyle(color: Colors.grey.shade800),
                    ),
                  ),
                );
              }

              // Onaylanmış randevuları listele
              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                itemCount: approvedAppointments.length,
                itemBuilder: (context, index) {
                  final appointment = approvedAppointments[index];
                  final DateTime appDate =
                      DateTime.parse(appointment['AppointmentDate']);
                  final String formattedDate =
                      DateFormat('dd MMMM yyyy - HH:mm', 'tr_TR').format(appDate);

                  return Card(
                    elevation: 3,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    color: const Color.fromARGB(255, 193, 211, 165), // Yeşil renk
                    child: ListTile(
                      leading: Icon(Icons.check_circle, color: Colors.green.shade900),
                      title: Text(
                        'Diyetisyen: ${appointment['DietitianName']}',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(formattedDate),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  // 2) GÜNLÜK MENÜ SAYFASI
  Widget _buildMenuPage() {
    final String formattedDate =
        DateFormat('dd MMMM yyyy', 'tr_TR').format(_selectedDay);
    return FutureBuilder<Map<String, dynamic>>(
      future: _dataService.getMealsForDay(widget.userId, _selectedDay),
      builder: (context, snapshot){
        if(snapshot.connectionState == ConnectionState.waiting){
          return Center(child: CircularProgressIndicator());
        }

        if(!snapshot.hasData || snapshot.data!['success'] == false){
          String errorMessage = snapshot.data?['message'] ?? "Yemekler yüklenemedi.";
          return Center(
            child: Text(
              errorMessage,
              style: TextStyle(color: Colors.red, fontSize: 16),
            ),
          );
        }
        final List meals = snapshot.data!['data'];

        if(meals.isEmpty){
          return Center(
            child: Text(
              '$formattedDate tarihinde eklenmiş bir öğün yok.',
              style: TextStyle(fontSize: 16, color: Colors.grey.shade700),
              textAlign: TextAlign.center,
            ),
          );
        }
        Map<String, List> mealsByType = {};
        for(var meal in meals){
          String type = meal['MealType'];
          if(!mealsByType.containsKey(type)){
            mealsByType[type] = [];
          }
          mealsByType[type]!.add(meal);
        }
        return ListView(
          padding: const EdgeInsets.all(16.0),
          children : mealsByType.entries.map((entry) {
            String mealType = entry.key;
            List mealItems = entry.value;
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Öğün Başlığı (Kahvaltı, Öğle Yemeği vb.)
                    Text(
                      mealType,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color.fromARGB(255, 125, 153, 92),
                      ),
                    ),
                    const Divider(height: 20),
                    
                    // O öğündeki yemeklerin listesi
                    ...mealItems.map((item) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          children: [
                            Icon(Icons.restaurant_menu, size: 20, color: Colors.grey.shade600),
                            const SizedBox(width: 12),
                            Text(
                              item['FoodName'],
                              style: TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

            

  // 3) İSTATİSTİKLER SAYFASI
   Widget _buildStatsPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Kilo Grafiği
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Icon(Icons.show_chart, size: 60, color: Colors.blue),
                  const SizedBox(height: 10),
                  const Text(
                    'Kilo Takip Grafiği',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Aylık kilo kaybı grafiği',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: _showAddWeightDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Kilo Ekle'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color.fromARGB(255, 125, 153, 92),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Adım Grafiği
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Icon(Icons.directions_walk,
                      size: 60, color: Colors.orange),
                  const SizedBox(height: 10),
                  const Text(
                    'Günlük Adım Sayısı',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Sağlık uygulamasından çekilen adım verileri',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Sağlık verisi gelecek')),
                      );
                    },
                    icon: const Icon(Icons.sync),
                    label: const Text('Verileri Senkronize Et'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color.fromARGB(255, 125, 153, 92),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentPage(){
    return FutureBuilder(
      // 1. "Asistan"ı çağırıp diyetisyenimizin kim olduğunu soruyoruz
      future: _dataService.getClientDetails(widget.userId),
      builder: (context, snapshot) {
        
        // --- DURUM 1: Veri henüz yükleniyor ---
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }

        // --- DURUM 2: API'den bir hata geldi ---
        if (!snapshot.hasData || snapshot.data!['success'] == false) {
          String errorMessage = snapshot.data?['message'] ?? "Bir hata oluştu.";
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Hata: $errorMessage \n\n Lütfen profilinizi kontrol edin.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.red, fontSize: 16),
              ),
            ),
          );
        }

        // --- DURUM 3: Başarılı! Veri geldi ---
        final clientData = snapshot.data!['data'];
        final int? dietitianId = clientData['AssignedDietitianID'];

        // --- DURUM 3A: Danışanın atanmış bir diyetisyeni YOK ---
        if (dietitianId == null) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Henüz bir diyetisyene atanmamışsınız. Lütfen diyetisyeninizden aldığınız davet kodu ile profinizi güncelleyin.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, color: Colors.grey.shade700),
              ),
            ),
          );
        }

        // --- DURUM 3B: Danışanın diyetisyeni VAR! Randevu formunu göster ---
        // '_assignedDietitianId' değişkenimizi güncelliyoruz
        _assignedDietitianId = dietitianId;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Diyetisyenden Randevu Talep Et',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),

              // Tarih Seçici
              Text('1. Randevu Tarihini Seçin:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 10),
              ListTile(
                tileColor: Colors.grey[100],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                leading: Icon(Icons.calendar_today, color: Color.fromARGB(255, 125, 153, 92)),
                title: Text(DateFormat('dd MMMM yyyy').format(_selectedAppointmentDate)),
                onTap: () async {
                  final DateTime? pickedDate = await showDatePicker(
                    context: context,
                    initialDate: _selectedAppointmentDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 90)), 
                  );
                  if (pickedDate != null) {
                    setState(() {
                      _selectedAppointmentDate = pickedDate;
                    });
                  }
                },
              ),
              const SizedBox(height: 20),

              // Saat Seçici
              Text('2. Randevu Saatini Seçin:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 10),
              ListTile(
                tileColor: Colors.grey[100],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                leading: Icon(Icons.access_time, color: Color.fromARGB(255, 125, 153, 92)),
                title: Text(_selectedAppointmentTime.format(context)),
                onTap: () async {
                  final TimeOfDay? pickedTime = await showTimePicker(
                    context: context,
                    initialTime: _selectedAppointmentTime,
                  );
                  if (pickedTime != null) {
                    setState(() {
                      _selectedAppointmentTime = pickedTime;
                    });
                  }
                },
              ),
              const SizedBox(height: 20),

              // Not Alanı
              Text('3. (İsteğe bağlı) Not Ekleyin:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 10),
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Diyetisyeninize iletmek istediğiniz notlar...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 30),

              // Talep Gönder Butonu
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: _isLoading ? SizedBox.shrink() : Icon(Icons.send),
                  label: _isLoading 
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text('Randevu Talebi Gönder', style: TextStyle(fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 125, 153, 92),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20.0),
                    ),
                  ),
                  onPressed: _isLoading ? null : () async {
                    
                    setState(() { _isLoading = true; });

                    // Tarih ve Saati birleştir
                    final DateTime fullAppointmentDate = DateTime(
                      _selectedAppointmentDate.year,
                      _selectedAppointmentDate.month,
                      _selectedAppointmentDate.day,
                      _selectedAppointmentTime.hour,
                      _selectedAppointmentTime.minute,
                    );

                    // API'den çektiğimiz gerçek diyetisyen ID'sini kullanıyoruz
                    final result = await _dataService.addAppointment(
                      clientUserId: widget.userId, 
                      dietitianUserId: _assignedDietitianId!, // <-- GERÇEK ID KULLANILDI
                      appointmentDate: fullAppointmentDate,
                      notes: _notesController.text,
                    );
                    // --- BİTİŞ ---

                    if (!mounted) return;
                    setState(() { _isLoading = false; });

                    if (result['success'] == true) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Randevu talebiniz başarıyla alındı!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                      // Formu temizle ve Ana Sayfaya dön
                      _notesController.clear();
                      _onItemTapped(0); 
                    } else {
                      _showErrorDialog(result['message']);
                    }
                  },
                ),
              ),
            ],
          ),
        );
      },
    );

  }

  Widget _buildChatPage() {
    return Center(
      child: Text(
        'Sohbet Sayfası - Özellik yakında eklenecek!',
        style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
        textAlign: TextAlign.center,
      ),
    );
  }
 

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 125, 153, 92),
        elevation: 0,
        title: Text(
          _selectedIndex == 0
      ? 'Ana Sayfa'
      : _selectedIndex == 1
          ? 'Günlük Beslenme'
          : _selectedIndex == 2
              ? 'İstatistikler'
          : _selectedIndex == 3
              ? 'Sohbet'
              : 'Randevu',
          style: const TextStyle(color: Colors.white),
        ),
      ),
      body: _getPage(_selectedIndex), // Seçili sayfayı göster

      // Sadece Günlük Menü'de + butonu göster
      floatingActionButton: _selectedIndex == 1
          ? FloatingActionButton(
              onPressed: _showAddMealDialog,
              backgroundColor: const Color.fromARGB(255, 125, 153, 92),
              child: const Icon(Icons.add),
            )
          : null,

      // ALT NAVİGASYON BAR
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[

          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Ana Sayfa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu),
            label: 'Günlük Beslenme', 
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.graphic_eq),
            label: 'İstatistikler',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Randevu al',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'Sohbet',
          ),
        ],
        currentIndex: _selectedIndex,
        backgroundColor: const Color.fromARGB(255, 193, 211, 165),
        selectedItemColor: const Color.fromARGB(255, 0, 0, 0),
        unselectedItemColor: const Color.fromARGB(255, 73, 72, 72),
        onTap: _onItemTapped,
      ),
    );
  }
}
